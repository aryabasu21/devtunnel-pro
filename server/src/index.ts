import express, { Request, Response } from "express";
import { createServer, IncomingMessage } from "http";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { TunnelManager } from "./tunnelManager";
import { RequestForwarder } from "./requestForwarder";

const app = express();
const PORT = process.env.PORT || 3001;
const DOMAIN = process.env.DOMAIN || "localhost:3001";
const WS_PATH = "/ws";

// Tunnel manager
const tunnelManager = new TunnelManager();
const requestForwarder = new RequestForwarder(tunnelManager);

// Middleware
const allowedOrigins = [
  "https://devportal.stylnode.in",
  "https://stylnode.in",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      // Allow exact matches
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow any *.tunnel.stylnode.in subdomain
      if (/^https:\/\/[^.]+\.tunnel\.stylnode\.in$/.test(origin))
        return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
// app.use(express.raw({ type: "*/*", limit: "10mb" }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", tunnels: tunnelManager.getActiveTunnelCount() });
});

// API: Get tunnel info
app.get("/api/tunnels/:tunnelId", (req, res) => {
  const tunnel = tunnelManager.getTunnel(req.params.tunnelId);
  if (!tunnel) {
    return res.status(404).json({ error: "Tunnel not found" });
  }
  res.json({
    id: tunnel.id,
    name: tunnel.name,
    url: tunnel.url,
    status: tunnel.status,
    createdAt: tunnel.createdAt,
  });
});

// API: List tunnels for device
app.get("/api/devices/:deviceId/tunnels", (req, res) => {
  const tunnels = tunnelManager.getTunnelsByDevice(req.params.deviceId);
  res.json(
    tunnels.map((t) => ({
      id: t.id,
      name: t.name,
      url: t.url,
      status: t.status,
      createdAt: t.createdAt,
    })),
  );
});

// Wildcard route - forward to tunnel
app.all("*", async (req: Request, res: Response) => {
  // Skip WebSocket upgrade path
  if (req.path === WS_PATH) {
    return res.status(400).json({ error: "Use WebSocket connection" });
  }

  const host = req.headers.host || "";
  const hostParts = host.split(".");

  // Check if this is the base domain (tunnel.stylnode.in, localhost, or onrender.com)
  const isBaseDomain =
    hostParts[0] === "tunnel" ||
    host.startsWith("localhost") ||
    host.includes("onrender.com") ||
    hostParts.length <= 2;

  if (isBaseDomain) {
    return res.json({
      service: "DevPortal Tunnel Server",
      version: "1.0.0",
      status: "running",
      activeTunnels: tunnelManager.getActiveTunnelCount(),
      docs: "https://devportal.stylnode.in/docs",
      usage:
        "Install CLI: npm install -g devportal-tunnel && devportal start 3000",
    });
  }

  const subdomain = hostParts[0];

  // Check if this is a tunnel request
  const tunnel = tunnelManager.getTunnelByName(subdomain);

  if (!tunnel || tunnel.status !== "live") {
    return res.status(404).json({
      error: "Tunnel not found",
      message: `No active tunnel found for ${subdomain}`,
      hint: "Make sure the tunnel is running and the subdomain is correct",
    });
  }

  // Check password protection
  if (tunnel.password) {
    const authHeader = req.headers["x-tunnel-password"] || req.query.password;
    if (authHeader !== tunnel.password) {
      return res.status(401).json({ error: "Password required" });
    }
  }

  // Forward request to CLI client
  try {
    const response = await requestForwarder.forward(tunnel, req);
    res.status(response.status);

    // Filter headers that Express should set automatically
    Object.entries(response.headers).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      if (
        value &&
        ![
          "transfer-encoding",
          "content-length",
          "connection",
          "content-encoding",
        ].includes(lowerKey)
      ) {
        res.setHeader(key, value);
      }
    });

    // Send response body
    res.end(response.body);
  } catch (error: any) {
    console.error("Forward error:", error.message);
    res.status(502).json({
      error: "Bad Gateway",
      message: "Failed to connect to local server",
      details: error.message,
    });
  }
});

// Create HTTP server
const httpServer = createServer(app);

// WebSocket server on the same port, different path
const wss = new WebSocketServer({ server: httpServer, path: WS_PATH });

wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
  console.log("New CLI connection from:", req.socket.remoteAddress);

  let tunnelId: string | null = null;

  ws.on("message", (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      handleClientMessage(ws, message, (id) => {
        tunnelId = id;
      });
    } catch (error) {
      console.error("Invalid message:", error);
      ws.send(
        JSON.stringify({ type: "error", message: "Invalid message format" }),
      );
    }
  });

  ws.on("close", () => {
    console.log("CLI disconnected");
    if (tunnelId) {
      tunnelManager.removeTunnel(tunnelId);
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  // Send welcome message
  ws.send(
    JSON.stringify({ type: "welcome", server: "DevPortal", version: "1.0.0" }),
  );
});

function handleClientMessage(
  ws: WebSocket,
  message: any,
  setTunnelId: (id: string) => void,
) {
  switch (message.type) {
    case "register": {
      const { deviceId, localPort, subdomain, password, demo } = message;

      // Check if subdomain is already taken
      if (subdomain && tunnelManager.getTunnelByName(subdomain)) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: `Subdomain "${subdomain}" is already in use`,
          }),
        );
        return;
      }

      // Generate tunnel name
      const name = subdomain || generateTunnelName();
      const id = `t-${uuidv4().slice(0, 8)}`;
      const url = DOMAIN.includes("localhost")
        ? `http://${name}.localhost:${PORT}`
        : `https://${name}.${DOMAIN}`;

      // Calculate expiry for demo mode
      const expiresAt = demo
        ? new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        : null;

      // Register tunnel
      tunnelManager.addTunnel({
        id,
        name,
        url,
        deviceId,
        localPort,
        password: password || null,
        status: "live",
        createdAt: new Date().toISOString(),
        expiresAt,
        ws,
      });

      setTunnelId(id);

      // Send success response
      ws.send(
        JSON.stringify({
          type: "registered",
          tunnel: { id, name, url, expiresAt },
        }),
      );

      console.log(
        `Tunnel registered: ${name} -> localhost:${localPort} (${deviceId})`,
      );
      break;
    }

    case "response": {
      const { requestId, status, headers, body } = message;
      requestForwarder.handleResponse(requestId, { status, headers, body });
      break;
    }

    case "ping": {
      ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
      break;
    }

    case "stop": {
      const { tunnelId } = message;
      tunnelManager.removeTunnel(tunnelId);
      ws.send(JSON.stringify({ type: "stopped", tunnelId }));
      break;
    }

    default:
      console.warn("Unknown message type:", message.type);
  }
}

// Tunnel name generator
const adjectives = [
  "purple",
  "cosmic",
  "hidden",
  "crystal",
  "silent",
  "golden",
  "frozen",
  "blazing",
  "lunar",
  "neon",
  "swift",
  "bright",
];
const nouns = [
  "horizon",
  "lake",
  "forest",
  "ocean",
  "canyon",
  "river",
  "meadow",
  "summit",
  "valley",
  "storm",
  "cloud",
  "wave",
];

function generateTunnelName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj}-${noun}-${num}`;
}

// Start server
httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║           DevPortal Server v1.0.0                     ║
╠═══════════════════════════════════════════════════════╣
║  HTTP:      http://localhost:${String(PORT).padEnd(25)}║
║  WebSocket: ws://localhost:${PORT}${WS_PATH.padEnd(21)}║
║  Domain:    ${DOMAIN.padEnd(42)}║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Cleanup expired tunnels periodically
setInterval(() => {
  tunnelManager.cleanupExpired();
}, 60000);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Shutting down...");
  wss.close();
  httpServer.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
