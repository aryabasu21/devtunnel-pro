import express, { Request, Response } from "express";
import { createServer, IncomingMessage } from "http";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { TunnelManager } from "./tunnelManager";
import { RequestForwarder } from "./requestForwarder";
import { Device } from "./models/Device";
import { TunnelRecord, type TunnelRecordStatus } from "./models/Tunnel";
import {
  checkRedisReadiness,
  closeRedis,
  redisEnabled,
  registerPresence,
  releaseTunnelSlot,
  reserveTunnelSlot,
  removePresence,
  startPresenceHeartbeat,
} from "./services/redisPresence";
import supportRoutes from "./routes/support";
import requestRoutes from "./routes/requests";
import { generateSubdomain, isValidSubdomain } from "./utils/subdomain";
import { clientMessageSchema, type ClientMessage } from "./protocol";
import {
  apiLimiter,
  strictLimiter,
  supportLimiter,
  tunnelTracker,
} from "./middleware/rateLimiting";
import {
  authenticate,
  getBearerTokenFromHeaders,
  verifyAccessToken,
} from "./middleware/auth";

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
const presenceHeartbeat = startPresenceHeartbeat(() =>
  tunnelManager.getAllTunnels().map((tunnel) => tunnel.id),
);

// Middleware
const allowedOrigins = [
  "https://devportal.stylnode.in",
  "https://stylnode.in",
  "https://web.postman.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
  // Allow any tunnel subdomain
  /^https:\/\/[a-z0-9-]+\.tunnel\.stylnode\.in$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman desktop, etc.)
      if (!origin) return callback(null, true);

      // Allow whitelisted origins
      const isAllowed = allowedOrigins.some((o) =>
        typeof o === "string" ? o === origin : o.test(origin),
      );

      if (isAllowed) {
        return callback(null, true);
      }

      // Reject everything else
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
app.use(strictLimiter); // Apply basic rate limiting to all routes

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", tunnels: tunnelManager.getActiveTunnelCount() });
});

app.get("/ready", (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  void checkRedisReadiness().then((redisReady) => {
    const ready = databaseReady && redisReady;

    res.status(ready ? 200 : 503).json({
    status: ready ? "ready" : "not_ready",
    checks: {
      database: databaseReady ? "ready" : "unavailable",
      redis: redisReady ? (redisEnabled ? "ready" : "not_configured") : "unavailable",
    },
    });
  });
});

// Handle preflight requests for API routes
app.options("/api/*", cors());

// API: Get tunnel info
app.get("/api/tunnels/:tunnelId", authenticate, async (req, res) => {
  const tunnel = tunnelManager.getTunnel(req.params.tunnelId);
  const persistedTunnel = tunnel
    ? null
    : await TunnelRecord.findOne({ tunnelId: req.params.tunnelId }).lean();

  if (!tunnel && !persistedTunnel) {
    return res.status(404).json({ error: "Tunnel not found" });
  }

  const deviceId = tunnel?.deviceId || persistedTunnel?.deviceId;
  if (!deviceId || !(await assertDeviceOwnership(req, res, deviceId))) return;

  res.json({
    id: tunnel?.id || persistedTunnel?.tunnelId,
    name: tunnel?.name || persistedTunnel?.name,
    url: tunnel?.url || persistedTunnel?.url,
    status: tunnel?.status || persistedTunnel?.status,
    createdAt: tunnel?.createdAt || persistedTunnel?.createdAt.toISOString(),
  });
});

// API: List tunnels for device
app.get("/api/devices/:deviceId/tunnels", authenticate, async (req, res) => {
  if (!(await assertDeviceOwnership(req, res, req.params.deviceId))) return;

  const activeTunnels = tunnelManager.getTunnelsByDevice(req.params.deviceId);
  const persistedTunnels = await TunnelRecord.find({
    deviceId: req.params.deviceId,
  })
    .sort({ createdAt: -1 })
    .lean();
  const activeIds = new Set(activeTunnels.map((tunnel) => tunnel.id));

  res.json(
    persistedTunnels
      .filter((tunnel) => !activeIds.has(tunnel.tunnelId))
      .map((tunnel) => ({
        id: tunnel.tunnelId,
        name: tunnel.name,
        url: tunnel.url,
        status: tunnel.status,
        createdAt: tunnel.createdAt.toISOString(),
      }))
      .concat(
        activeTunnels.map((tunnel) => ({
          id: tunnel.id,
          name: tunnel.name,
          url: tunnel.url,
          status: tunnel.status,
          createdAt: tunnel.createdAt,
        })),
      ),
  );
});

async function assertDeviceOwnership(
  req: Request,
  res: Response,
  deviceId: string,
): Promise<boolean> {
  if (!req.identity) {
    res.status(401).json({
      error: "authentication_required",
      message: "A bearer access token is required.",
    });
    return false;
  }

  const device = await Device.findOne({
    deviceId,
    ownerSubject: req.identity.subject,
  }).lean();
  if (!device) {
    res.status(403).json({
      error: "device_access_denied",
      message: "You do not have access to this device.",
    });
    return false;
  }

  return true;
}

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
      version: "1.0.2",
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
    });
  }
});

// Create HTTP server
const httpServer = createServer(app);

// WebSocket server on the same port, different path
const wss = new WebSocketServer({
  server: httpServer,
  path: WS_PATH,
  maxPayload: 20 * 1024 * 1024,
});

wss.on("connection", async (ws: WebSocket, req: IncomingMessage) => {
  let identitySubject: string | undefined;
  const oidcConfigured = Boolean(
    process.env.OIDC_ISSUER && process.env.OIDC_AUDIENCE,
  );
  if (oidcConfigured) {
    const token = getBearerTokenFromHeaders(req.headers);
    if (!token) {
      ws.close(1008, "Authentication required");
      return;
    }

    try {
      const identity = await verifyAccessToken(token);
      identitySubject = identity.subject;
    } catch {
      ws.close(1008, "Invalid authentication");
      return;
    }
  }

  const clientIP = req.socket.remoteAddress || "unknown";
  console.log("New CLI connection from:", clientIP);

  // Server-side ping to keep connection alive (every 20 seconds)
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 20000);

  ws.on("message", (data: Buffer) => {
    try {
      const parsedMessage = clientMessageSchema.safeParse(JSON.parse(data.toString()));
      if (!parsedMessage.success) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Invalid tunnel message",
          }),
        );
        return;
      }

      const message = parsedMessage.data;
      void handleClientMessage(ws, message, clientIP, identitySubject);
    } catch (error) {
      ws.send(
        JSON.stringify({ type: "error", message: "Invalid message format" }),
      );
    }
  });

  ws.on("close", () => {
    console.log("CLI disconnected");
    clearInterval(pingInterval);
    const disconnectedTunnels = tunnelManager.removeTunnelsByWebSocket(ws);
    disconnectedTunnels.forEach((tunnel) => {
      requestForwarder.rejectPendingForTunnel(tunnel.id);
      void updateTunnelRecord(tunnel.id, "disconnected");
      void removePresence(tunnel.id);
      void releaseTunnelSlot(clientIP);
      tunnelTracker.removeTunnel(clientIP);
    });
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
    clearInterval(pingInterval);
  });

  // Send welcome message
  ws.send(
    JSON.stringify({ type: "welcome", server: "DevPortal", version: "1.0.2" }),
  );
});

function handleClientMessage(
  ws: WebSocket,
  message: ClientMessage,
  clientIP: string,
  identitySubject?: string,
) {
  switch (message.type) {
    case "register": {
      const { deviceId, localPort, subdomain, password, demo } = message;

      if (process.env.OIDC_ISSUER && !identitySubject) {
        ws.send(JSON.stringify({ type: "error", message: "Authentication required" }));
        return;
      }

      if (identitySubject) {
        void Device.findOneAndUpdate(
          { deviceId },
          {
            $setOnInsert: { deviceId, ownerSubject: identitySubject },
            $set: { lastSeenAt: new Date() },
          },
          { upsert: true, new: true },
        ).then((device) => {
          if (device.ownerSubject !== identitySubject) {
            ws.send(JSON.stringify({ type: "error", message: "Device ownership check failed" }));
            return;
          }

          registerTunnel(ws, clientIP, message, identitySubject);
        }).catch(() => {
          ws.send(JSON.stringify({ type: "error", message: "Device registration failed" }));
        });
        return;
      }

      registerTunnel(ws, clientIP, message);
      return;
    }

    case "response": {
      const { requestId, status, headers, body } = message;
      const connectionTunnel = tunnelManager.getTunnelByWebSocket(ws);
      if (!connectionTunnel) {
        ws.send(JSON.stringify({ type: "error", message: "Tunnel is not registered" }));
        return;
      }

      requestForwarder.handleResponse(
        requestId,
        { status, headers, body },
        connectionTunnel.id,
      );
      return;
    }

    case "ping": {
      ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
      return;
    }

    case "stop": {
      const { tunnelId } = message;
      const tunnel = tunnelManager.getTunnel(tunnelId);
      if (!tunnel || tunnel.ws !== ws) {
        ws.send(JSON.stringify({ type: "error", message: "Tunnel ownership check failed" }));
        return;
      }

      tunnelManager.removeTunnel(tunnelId);
      void updateTunnelRecord(tunnelId, "stopped");
      void releaseTunnelSlot(tunnel.clientIp);
      ws.send(JSON.stringify({ type: "stopped", tunnelId }));
      return;
    }

    default:
      return;
  }
}

async function registerTunnel(
  ws: WebSocket,
  clientIP: string,
  message: Extract<ClientMessage, { type: "register" }>,
  ownerSubject?: string,
): Promise<void> {
  const { deviceId, localPort, subdomain, password, demo } = message;

  let distributedSlotReserved = false;
  try {
    distributedSlotReserved = await reserveTunnelSlot(clientIP);
  } catch (error) {
    console.error("Failed to reserve distributed tunnel slot:", error);
    ws.send(JSON.stringify({ type: "error", message: "Tunnel limits are temporarily unavailable" }));
    return;
  }

  if (!distributedSlotReserved) {
    ws.send(JSON.stringify({ type: "error", message: "Tunnel limit exceeded" }));
    return;
  }

      // Check tunnel limits per IP
      if (!tunnelTracker.canCreateTunnel(clientIP)) {
        await releaseTunnelSlot(clientIP);
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
          await releaseTunnelSlot(clientIP);
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
          await releaseTunnelSlot(clientIP);
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
        clientIp: clientIP,
        localPort,
        password: password || null,
        status: "live",
        createdAt: new Date().toISOString(),
        expiresAt,
        ws,
      });

      try {
        await registerPresence({ tunnelId: id, deviceId, name });
      } catch (error) {
        tunnelManager.removeTunnel(id, false);
        await releaseTunnelSlot(clientIP);
        ws.send(JSON.stringify({ type: "error", message: "Shared tunnel coordination is unavailable" }));
        console.error("Failed to register tunnel presence:", error);
        return;
      }

      void TunnelRecord.findOneAndUpdate(
        { tunnelId: id },
        {
          $set: {
            name,
            url,
            deviceId,
            ownerSubject,
            localPort,
            status: "live",
            lastSeenAt: new Date(),
            expiresAt: expiresAt ? new Date(expiresAt) : null,
          },
          $setOnInsert: { tunnelId: id, createdAt: new Date() },
        },
        { upsert: true, new: true },
      ).catch((error) => {
        console.error("Failed to persist tunnel metadata:", error);
      });

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
}

async function updateTunnelRecord(
  tunnelId: string,
  status: TunnelRecordStatus,
): Promise<void> {
  try {
    await TunnelRecord.updateOne(
      { tunnelId },
      { $set: { status, lastSeenAt: new Date() } },
    );
  } catch (error) {
    console.error("Failed to update tunnel metadata:", error);
  }
}

// Start server
httpServer.listen({ port: PORT, host: "0.0.0.0" }, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║           DevPortal Server v1.0.2                     ║
╠═══════════════════════════════════════════════════════╣
║  HTTP:      http://localhost:${String(PORT).padEnd(25)}║
║  WebSocket: ws://localhost:${PORT}${WS_PATH.padEnd(21)}║
║  Domain:    ${DOMAIN.padEnd(42)}║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Cleanup expired tunnels periodically
setInterval(() => {
  const expiredTunnels = tunnelManager.cleanupExpired();
  expiredTunnels.forEach((tunnel) => {
    void updateTunnelRecord(tunnel.id, "expired");
    void removePresence(tunnel.id);
    void releaseTunnelSlot(tunnel.clientIp);
  });
}, 60000);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Shutting down...");
  clearInterval(presenceHeartbeat);
  requestForwarder.rejectAllPending();
  tunnelManager.getAllTunnels().forEach((tunnel) => {
    void removePresence(tunnel.id);
    void releaseTunnelSlot(tunnel.clientIp);
    tunnelManager.removeTunnel(tunnel.id, false);
  });
  wss.close();
  httpServer.close(() => {
    void closeRedis().finally(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });
});
