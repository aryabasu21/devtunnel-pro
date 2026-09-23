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

import {
  apiLimiter,
  strictLimiter,
  supportLimiter,
  tunnelTracker,
} from "./middleware/rateLimiting";

import { generateSubdomain, isValidSubdomain } from "./utils/subdomain";

const app = express();

const PORT = Number(process.env.PORT) || 3001;

const DOMAIN = process.env.DOMAIN || "localhost:3001";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/devportal";

const WS_PATH = "/ws";

// ============================================================
// MONGODB
// ============================================================

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// ============================================================
// TUNNEL MANAGER
// ============================================================

const tunnelManager = new TunnelManager();

const requestForwarder = new RequestForwarder(tunnelManager);

// ============================================================
// CORS
// ============================================================

const allowedOrigins = [
  "https://devportal.stylnode.in",
  "https://stylnode.in",
  "https://web.postman.com",

  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",

  // Allow tunnel subdomains
  /^https:\/\/[a-z0-9-]+\.tunnel\.stylnode\.in$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without Origin
      // e.g. curl, Postman desktop, mobile apps
      if (!origin) {
        return callback(null, true);
      }

      const isAllowed = allowedOrigins.some((allowed) =>
        typeof allowed === "string" ? allowed === origin : allowed.test(origin),
      );

      if (isAllowed) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Tunnel-Password",
      "X-API-Key",
      "X-Request-ID",
      "Accept",
      "Accept-Encoding",
      "Accept-Language",
      "User-Agent",
      "Referer",
      "Cache-Control",
      "If-Modified-Since",
      "If-None-Match",
      "X-CSRF-Token",
      "X-Forwarded-For",
      "X-Forwarded-Proto",
      "X-Custom-Header",
    ],
  }),
);

// ============================================================
// BODY PARSING
// ============================================================

app.use(
  express.json({
    limit: "10mb",
  }),
);

// Skip raw body parsing for multipart.
// Multer handles multipart requests.
app.use(
  express.raw({
    type: (req) => {
      const contentType = req.headers["content-type"] || "";

      return !contentType.includes("multipart/form-data");
    },

    limit: "10mb",
  }),
);

// ============================================================
// RATE LIMITING
// ============================================================

app.use(strictLimiter);

// ============================================================
// HEALTH
// ============================================================

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    tunnels: tunnelManager.getActiveTunnelCount(),
  });
});

// ============================================================
// API PREFLIGHT
// ============================================================

app.options("/api/*", cors());

// ============================================================
// API: GET TUNNEL
// ============================================================

app.get("/api/tunnels/:tunnelId", (req, res) => {
  const tunnel = tunnelManager.getTunnel(req.params.tunnelId);

  if (!tunnel) {
    return res.status(404).json({
      error: "Tunnel not found",
    });
  }

  return res.json({
    id: tunnel.id,
    name: tunnel.name,
    url: tunnel.url,
    status: tunnel.status,
    createdAt: tunnel.createdAt,
  });
});

// ============================================================
// API: GET DEVICE TUNNELS
// ============================================================

app.get("/api/devices/:deviceId/tunnels", (req, res) => {
  const tunnels = tunnelManager.getTunnelsByDevice(req.params.deviceId);

  return res.json(
    tunnels.map((tunnel) => ({
      id: tunnel.id,
      name: tunnel.name,
      url: tunnel.url,
      status: tunnel.status,
      createdAt: tunnel.createdAt,
    })),
  );
});

// ============================================================
// SUPPORT ROUTES
// ============================================================

app.use("/api/support", supportLimiter, supportRoutes);

// ============================================================
// REQUEST LOGGING ROUTES
// ============================================================

app.use("/api/requests", apiLimiter, requestRoutes);

// ============================================================
// HTTP TUNNEL FORWARDING
// ============================================================

app.all("*", async (req: Request, res: Response) => {
  // --------------------------------------------------------
  // Don't handle WebSocket control path through Express
  // --------------------------------------------------------

  if (req.path === WS_PATH) {
    return res.status(400).json({
      error: "Use WebSocket connection",
    });
  }

  const host = req.headers.host || "";

  const hostParts = host.split(".");

  // --------------------------------------------------------
  // Base domain
  // --------------------------------------------------------

  const isBaseDomain =
    hostParts[0] === "tunnel" ||
    host.startsWith("localhost") ||
    host.includes("onrender.com") ||
    hostParts.length <= 2;

  if (isBaseDomain) {
    return res.json({
      service: "DevPortal Tunnel Server",

      version: "1.0.2",

      status: "running",

      activeTunnels: tunnelManager.getActiveTunnelCount(),

      docs: "https://devportal.stylnode.in/docs",

      usage:
        "Install CLI: npm install -g devportal-tunnel && devportal start 3000",
    });
  }

  // --------------------------------------------------------
  // Tunnel subdomain
  // --------------------------------------------------------

  const subdomain = hostParts[0];

  const tunnel = tunnelManager.getTunnelByName(subdomain);

  if (!tunnel || tunnel.status !== "live") {
    return res.status(404).json({
      error: "Tunnel not found",

      message: `No active tunnel found for ${subdomain}`,

      hint: "Make sure the tunnel is running and the subdomain is correct",
    });
  }

  // --------------------------------------------------------
  // Tunnel password
  // --------------------------------------------------------

  if (tunnel.password) {
    const authHeader = req.headers["x-tunnel-password"] || req.query.password;

    if (authHeader !== tunnel.password) {
      return res.status(401).json({
        error: "Password required",
      });
    }
  }

  // --------------------------------------------------------
  // Forward request to CLI
  // --------------------------------------------------------

  try {
    const response = await requestForwarder.forward(tunnel, req);

    res.status(response.status);

    // Filter headers that Express
    // should handle itself.
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

    res.end(response.body);
  } catch (error: any) {
    console.error("Forward error:", error.message);

    return res.status(502).json({
      error: "Bad Gateway",

      message: "Failed to connect to local server",

      details: error.message,
    });
  }
});

// ============================================================
// HTTP SERVER
// ============================================================

const httpServer = createServer(app);

// ============================================================
// WEBSOCKET SERVERS
// ============================================================

/**
 * CLI control WebSocket.
 *
 * Example:
 *
 * wss://tunnel.stylnode.in/ws
 */
const wss = new WebSocketServer({
  noServer: true,
});

/**
 * Browser/application WebSocket.
 *
 * Example:
 *
 * wss://clever-hawk-a5a4b5df.tunnel.stylnode.in/
 *
 * These connections are forwarded through
 * the CLI control WebSocket.
 */
const tunnelWss = new WebSocketServer({
  noServer: true,
});

// ============================================================
// BROWSER WEBSOCKET REGISTRY
// ============================================================

/**
 * Browser WebSocket ID
 * ->
 * Browser WebSocket
 */
const browserSockets = new Map<string, WebSocket>();

/**
 * Browser WebSocket ID
 * ->
 * Tunnel ID
 */
const browserSocketTunnels = new Map<string, string>();

// ============================================================
// HTTP UPGRADE HANDLER
// ============================================================

httpServer.on("upgrade", (req: IncomingMessage, socket, head) => {
  try {
    const host = req.headers.host || "";

    const requestUrl = req.url || "/";

    const url = new URL(requestUrl, `http://${host}`);

    // ======================================================
    // CLI CONTROL WEBSOCKET
    // ======================================================

    const isCliHost =
      host.startsWith("tunnel.stylnode.in") ||
      host.startsWith("localhost") ||
      host.includes("onrender.com");

    if (url.pathname === WS_PATH && isCliHost) {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });

      return;
    }

    // ======================================================
    // BROWSER / APPLICATION WEBSOCKET
    // ======================================================

    const hostWithoutPort = host.split(":")[0];

    const hostParts = hostWithoutPort.split(".");

    /**
     * Expected:
     *
     * clever-hawk-a5a4b5df
     * tunnel
     * stylnode
     * in
     */

    const isTunnelHost =
      hostParts.length >= 4 &&
      hostParts.slice(1).join(".") === "tunnel.stylnode.in";

    if (!isTunnelHost) {
      socket.write(
        "HTTP/1.1 404 Not Found\r\n" + "Connection: close\r\n" + "\r\n",
      );

      socket.destroy();

      return;
    }

    const subdomain = hostParts[0];

    const tunnel = tunnelManager.getTunnelByName(subdomain);

    if (!tunnel || tunnel.status !== "live") {
      socket.write(
        "HTTP/1.1 404 Not Found\r\n" + "Connection: close\r\n" + "\r\n",
      );

      socket.destroy();

      return;
    }

    // ======================================================
    // PASSWORD PROTECTION
    // ======================================================

    if (tunnel.password) {
      const password = url.searchParams.get("password");

      if (password !== tunnel.password) {
        socket.write(
          "HTTP/1.1 401 Unauthorized\r\n" + "Connection: close\r\n" + "\r\n",
        );

        socket.destroy();

        return;
      }
    }

    // ======================================================
    // UPGRADE TO BROWSER WEBSOCKET
    // ======================================================

    tunnelWss.handleUpgrade(req, socket, head, (browserWs) => {
      handleBrowserWebSocket(browserWs, req, tunnel.id, tunnel.ws);
    });
  } catch (error) {
    console.error("WebSocket upgrade error:", error);

    socket.destroy();
  }
});

// ============================================================
// BROWSER WEBSOCKET HANDLER
// ============================================================

function handleBrowserWebSocket(
  browserWs: WebSocket,
  req: IncomingMessage,
  tunnelId: string,
  cliWs: WebSocket,
): void {
  const wsId = uuidv4();

  browserSockets.set(wsId, browserWs);

  browserSocketTunnels.set(wsId, tunnelId);

  const path = req.url || "/";

  const headers: Record<string, string> = {};

  // ----------------------------------------------------------
  // Copy request headers
  // ----------------------------------------------------------

  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "string") {
      headers[key] = value;
    } else if (Array.isArray(value)) {
      headers[key] = value.join(", ");
    }
  }

  // ----------------------------------------------------------
  // Remove proxy-specific headers
  // ----------------------------------------------------------

  delete headers["content-length"];

  delete headers["transfer-encoding"];

  console.log(`Browser WebSocket opened: ${wsId} -> tunnel ${tunnelId}`);

  // ----------------------------------------------------------
  // Verify CLI connection
  // ----------------------------------------------------------

  if (cliWs.readyState !== WebSocket.OPEN) {
    browserSockets.delete(wsId);

    browserSocketTunnels.delete(wsId);

    browserWs.close();

    return;
  }

  // ----------------------------------------------------------
  // Tell CLI to open local WebSocket
  // ----------------------------------------------------------

  cliWs.send(
    JSON.stringify({
      type: "ws-open",
      wsId,
      path,
      headers,
    }),
  );

  // ----------------------------------------------------------
  // Browser -> CLI
  // ----------------------------------------------------------

  browserWs.on("message", (data: Buffer, isBinary: boolean) => {
    if (cliWs.readyState !== WebSocket.OPEN) {
      return;
    }

    cliWs.send(
      JSON.stringify({
        type: "ws-message",

        wsId,

        data: Buffer.from(data).toString("base64"),

        binary: isBinary,
      }),
    );
  });

  // ----------------------------------------------------------
  // Browser closes
  // ----------------------------------------------------------

  browserWs.on("close", () => {
    console.log(`Browser WebSocket closed: ${wsId}`);

    browserSockets.delete(wsId);

    browserSocketTunnels.delete(wsId);

    if (cliWs.readyState === WebSocket.OPEN) {
      cliWs.send(
        JSON.stringify({
          type: "ws-close",
          wsId,
        }),
      );
    }
  });

  // ----------------------------------------------------------
  // Browser error
  // ----------------------------------------------------------

  browserWs.on("error", (error) => {
    console.error(`Browser WebSocket error (${wsId}):`, error.message);
  });
}

// ============================================================
// CLI CONTROL WEBSOCKET
// ============================================================

wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
  const clientIP = req.socket.remoteAddress || "unknown";

  console.log("New CLI connection from:", clientIP);

  let tunnelId: string | null = null;

  // --------------------------------------------------------
  // Server-side ping
  // --------------------------------------------------------

  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 20000);

  // --------------------------------------------------------
  // CLI messages
  // --------------------------------------------------------

  ws.on("message", (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());

      handleClientMessage(ws, message, clientIP, (id) => {
        tunnelId = id;
      });
    } catch (error) {
      console.error("Invalid message:", error);

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Invalid message format",
          }),
        );
      }
    }
  });

  // --------------------------------------------------------
  // CLI disconnect
  // --------------------------------------------------------

  ws.on("close", () => {
    console.log("CLI disconnected");

    clearInterval(pingInterval);

    if (tunnelId) {
      closeBrowserSocketsForTunnel(tunnelId);

      tunnelManager.removeTunnel(tunnelId);

      tunnelTracker.removeTunnel(clientIP);
    }
  });

  // --------------------------------------------------------
  // CLI error
  // --------------------------------------------------------

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);

    clearInterval(pingInterval);
  });

  // --------------------------------------------------------
  // Welcome
  // --------------------------------------------------------

  ws.send(
    JSON.stringify({
      type: "welcome",
      server: "DevPortal",
      version: "1.0.2",
    }),
  );
});

// ============================================================
// CLOSE BROWSER SOCKETS FOR A TUNNEL
// ============================================================

function closeBrowserSocketsForTunnel(tunnelId: string): void {
  for (const [wsId, browserWs] of browserSockets.entries()) {
    const socketTunnelId = browserSocketTunnels.get(wsId);

    if (socketTunnelId !== tunnelId) {
      continue;
    }

    if (
      browserWs.readyState === WebSocket.OPEN ||
      browserWs.readyState === WebSocket.CONNECTING
    ) {
      browserWs.close();
    }

    browserSockets.delete(wsId);

    browserSocketTunnels.delete(wsId);
  }
}

// ============================================================
// CLI MESSAGE HANDLER
// ============================================================

function handleClientMessage(
  ws: WebSocket,
  message: any,
  clientIP: string,
  setTunnelId: (id: string) => void,
): void {
  switch (message.type) {
    // ========================================================
    // REGISTER
    // ========================================================

    case "register": {
      const { deviceId, localPort, subdomain, password, demo } = message;

      // ------------------------------------------------------
      // Tunnel limit
      // ------------------------------------------------------

      if (!tunnelTracker.canCreateTunnel(clientIP)) {
        ws.send(
          JSON.stringify({
            type: "error",

            message:
              "Tunnel limit exceeded. You can only have 3 active tunnels per IP address. Please close some tunnels before creating new ones.",
          }),
        );

        return;
      }

      // ------------------------------------------------------
      // Generate / validate subdomain
      // ------------------------------------------------------

      let name: string;

      if (subdomain) {
        if (!isValidSubdomain(subdomain)) {
          ws.send(
            JSON.stringify({
              type: "error",

              message: `Invalid subdomain "${subdomain}". Must be 1-63 characters, contain only letters, numbers, and hyphens, and not be reserved.`,
            }),
          );

          return;
        }

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
        do {
          name = generateSubdomain();
        } while (tunnelManager.getTunnelByName(name));
      }

      // ------------------------------------------------------
      // Tunnel ID
      // ------------------------------------------------------

      const id = `t-${uuidv4().slice(0, 8)}`;

      // ------------------------------------------------------
      // Public URL
      // ------------------------------------------------------

      const url = DOMAIN.includes("localhost")
        ? `http://${name}.localhost:${PORT}`
        : `https://${name}.${DOMAIN}`;

      // ------------------------------------------------------
      // Demo expiry
      // ------------------------------------------------------

      const expiresAt = demo
        ? new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        : null;

      // ------------------------------------------------------
      // Add tunnel
      // ------------------------------------------------------

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

        // CLI control WebSocket
        ws,
      });

      setTunnelId(id);

      tunnelTracker.addTunnel(clientIP);

      // ------------------------------------------------------
      // Registration response
      // ------------------------------------------------------

      ws.send(
        JSON.stringify({
          type: "registered",

          tunnel: {
            id,
            name,
            url,
            expiresAt,
          },
        }),
      );

      console.log(
        `Tunnel registered: ${name} -> localhost:${localPort} (${deviceId})`,
      );

      break;
    }

    // ========================================================
    // HTTP RESPONSE FROM CLI
    // ========================================================

    case "response": {
      const { requestId, status, headers, body } = message;

      requestForwarder.handleResponse(requestId, {
        status,
        headers,
        body,
      });

      break;
    }

    // ========================================================
    // LOCAL WEBSOCKET OPENED
    // ========================================================

    case "ws-opened": {
      const { wsId } = message;

      const browserWs = browserSockets.get(wsId);

      if (browserWs?.readyState === WebSocket.OPEN) {
        console.log(`Local WebSocket opened: ${wsId}`);
      }

      break;
    }

    // ========================================================
    // LOCAL APP -> CLI -> SERVER -> BROWSER
    // ========================================================

    case "ws-message": {
      const { wsId, data, binary } = message;

      const browserWs = browserSockets.get(wsId);

      if (!browserWs || browserWs.readyState !== WebSocket.OPEN) {
        return;
      }

      try {
        const payload = Buffer.from(data, "base64");

        if (binary) {
          browserWs.send(payload);
        } else {
          browserWs.send(payload.toString("utf8"));
        }
      } catch (error) {
        console.error(`Failed to forward WebSocket message ${wsId}:`, error);
      }

      break;
    }

    // ========================================================
    // LOCAL APP CLOSED SOCKET
    // ========================================================

    case "ws-close": {
      const { wsId } = message;

      const browserWs = browserSockets.get(wsId);

      if (!browserWs) {
        return;
      }

      if (
        browserWs.readyState === WebSocket.OPEN ||
        browserWs.readyState === WebSocket.CONNECTING
      ) {
        browserWs.close();
      }

      browserSockets.delete(wsId);

      browserSocketTunnels.delete(wsId);

      break;
    }

    // ========================================================
    // PING
    // ========================================================

    case "ping": {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "pong",
            timestamp: Date.now(),
          }),
        );
      }

      break;
    }

    // ========================================================
    // STOP
    // ========================================================

    case "stop": {
      const { tunnelId } = message;

      closeBrowserSocketsForTunnel(tunnelId);

      tunnelManager.removeTunnel(tunnelId);

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "stopped",
            tunnelId,
          }),
        );
      }

      break;
    }

    // ========================================================
    // UNKNOWN
    // ========================================================

    default: {
      console.warn("Unknown message type:", message.type);
    }
  }
}

// ============================================================
// START SERVER
// ============================================================

httpServer.listen(
  {
    port: PORT,
    host: "0.0.0.0",
  },
  () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║           DevPortal Server v1.0.2                     ║
╠═══════════════════════════════════════════════════════╣
║  HTTP:      http://${DOMAIN.padEnd(34)}║
║  WebSocket: ws://${DOMAIN}${WS_PATH.padEnd(16)}║
║  Domain:    ${DOMAIN.padEnd(42)}║
╚═══════════════════════════════════════════════════════╝
`);
  },
);

// ============================================================
// EXPIRED TUNNEL CLEANUP
// ============================================================

setInterval(() => {
  tunnelManager.cleanupExpired();
}, 60000);

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

process.on("SIGTERM", () => {
  console.log("Shutting down...");

  // Close browser sockets
  for (const browserWs of browserSockets.values()) {
    if (
      browserWs.readyState === WebSocket.OPEN ||
      browserWs.readyState === WebSocket.CONNECTING
    ) {
      browserWs.close();
    }
  }

  browserSockets.clear();

  browserSocketTunnels.clear();

  // Close WebSocket servers
  wss.close();

  tunnelWss.close();

  // Close HTTP server
  httpServer.close(() => {
    console.log("Server closed");

    process.exit(0);
  });
});
