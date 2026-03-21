import express, { Request, Response } from "express";
import { createServer, IncomingMessage } from "http";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { TunnelManager } from "./tunnelManager";
import { RequestForwarder } from "./requestForwarder";
import supportRoutes from "./routes/support";
import requestRoutes from "./routes/requests";
import { generateSubdomain, isValidSubdomain } from "./utils/subdomain";
import {
  apiLimiter,
  strictLimiter,
  supportLimiter,
  tunnelTracker,
  checkTunnelLimit,
} from "./middleware/rateLimiting";

const app = express();
const PORT = process.env.PORT || 3001;
const DOMAIN = process.env.DOMAIN || "localhost:3001";
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/devportal";
const WS_PATH = "/ws";

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Verify email configuration
// verifyEmailConfig();

// Tunnel manager
const tunnelManager = new TunnelManager();
const requestForwarder = new RequestForwarder(tunnelManager);

// Middleware
const allowedOrigins = [
  "https://devportal.stylnode.in",
  "https://stylnode.in",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
  // Allow any tunnel subdomain
  /^https:\/\/[a-z0-9-]+\.tunnel\.stylnode\.in$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      // Allow exact string matches
      if (allowedOrigins.some(o => typeof o === 'string' ? o === origin : o.test(origin))) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Tunnel-Password"],
  }),
);
app.use(express.json({ limit: "10mb" }));
// Skip raw body parsing for multipart (file uploads) - multer handles those
app.use(
  express.raw({
    type: (req) => {
      const contentType = req.headers["content-type"] || "";
      return !contentType.includes("multipart/form-data");
    },
    limit: "10mb",
  }),
);

// Apply rate limiting
// app.use(strictLimiter); // Apply basic rate limiting to all routes

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", tunnels: tunnelManager.getActiveTunnelCount() });
});

// Handle preflight requests for API routes
app.options("/api/*", cors());

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

// Support ticket routes
app.use("/api/support", supportLimiter, supportRoutes);

// Request logging routes
app.use("/api/requests", apiLimiter, requestRoutes);

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
  const clientIP = req.socket.remoteAddress || "unknown";
  console.log("New CLI connection from:", clientIP);

  let tunnelId: string | null = null;

  // Server-side ping to keep connection alive (every 20 seconds)
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 20000);

  ws.on("message", (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      handleClientMessage(ws, message, clientIP, (id) => {
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
    clearInterval(pingInterval);
    if (tunnelId) {
      tunnelManager.removeTunnel(tunnelId);
      // Remove tunnel from IP tracking
      tunnelTracker.removeTunnel(clientIP);
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
    clearInterval(pingInterval);
  });

  // Send welcome message
  ws.send(
    JSON.stringify({ type: "welcome", server: "DevPortal", version: "1.0.0" }),
  );
});

function handleClientMessage(
  ws: WebSocket,
  message: any,
  clientIP: string,
  setTunnelId: (id: string) => void,
) {
  switch (message.type) {
    case "register": {
      const { deviceId, localPort, subdomain, password, demo } = message;

      // Check tunnel limits per IP
      if (!tunnelTracker.canCreateTunnel(clientIP)) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: `Tunnel limit exceeded. You can only have ${3} active tunnels per IP address. Please close some tunnels before creating new ones.`,
          }),
        );
        return;
      }

      // Validate and generate subdomain
      let name: string;

      if (subdomain) {
        // Validate custom subdomain
        if (!isValidSubdomain(subdomain)) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: `Invalid subdomain "${subdomain}". Must be 1-63 characters, contain only letters, numbers, and hyphens, and not be reserved.`,
            }),
          );
          return;
        }

        // Check if subdomain is already taken
        if (tunnelManager.getTunnelByName(subdomain)) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: `Subdomain "${subdomain}" is already in use. Try a different name.`,
            }),
          );
          return;
        }

        name = subdomain;
      } else {
        // Generate memorable subdomain
        do {
          name = generateSubdomain();
        } while (tunnelManager.getTunnelByName(name)); // Ensure uniqueness
      }
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

      // Add tunnel to IP tracking
      tunnelTracker.addTunnel(clientIP);

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

// Start server
httpServer.listen({ port: PORT, host: "0.0.0.0" }, () => {
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
