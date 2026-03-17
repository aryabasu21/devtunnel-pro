import { Request } from "express";
import { WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import { TunnelManager, Tunnel } from "./tunnelManager";
import { RequestLog } from "./models/RequestLog";

interface PendingRequest {
  resolve: (response: ForwardedResponse) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
  startTime: number;
  logData: {
    tunnelId: string;
    tunnelName: string;
    deviceId: string;
    method: string;
    path: string;
    query: Record<string, any>;
    headers: Record<string, any>;
    requestBody?: string;
    userAgent?: string;
    ip?: string;
  };
}

export interface ForwardedResponse {
  status: number;
  headers: Record<string, string>;
  body: Buffer | string;
}

export class RequestForwarder {
  private tunnelManager: TunnelManager;
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private readonly REQUEST_TIMEOUT = 30000; // 30 seconds

  constructor(tunnelManager: TunnelManager) {
    this.tunnelManager = tunnelManager;
  }

  async forward(tunnel: Tunnel, req: Request): Promise<ForwardedResponse> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      if (tunnel.ws.readyState !== WebSocket.OPEN) {
        reject(new Error("Tunnel connection not available"));
        return;
      }

      const requestId = uuidv4();

      // Prepare log data
      const logData = {
        tunnelId: tunnel.id,
        tunnelName: tunnel.name,
        deviceId: tunnel.deviceId,
        method: req.method,
        path: req.originalUrl,
        query: req.query || {},
        headers: this.sanitizeHeaders(req.headers),
        requestBody: this.serializeBody(req.body) || undefined,
        userAgent: req.headers["user-agent"],
        ip: req.ip || req.socket.remoteAddress || "unknown",
      };

      // Set timeout for request
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);

        // Log timeout error
        this.saveRequestLog(logData, 504, {}, "Request timeout", Date.now() - startTime);

        reject(new Error("Request timeout"));
      }, this.REQUEST_TIMEOUT);

      // Store pending request with logging data
      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        timeout,
        startTime,
        logData
      });

      // Prepare request data
      const headers = this.filterHeaders(req.headers);

      // ✅ override important headers
      headers["host"] = `localhost:${tunnel.localPort}`;
      headers["origin"] = `http://localhost:${tunnel.localPort}`;
      headers["referer"] = `http://localhost:${tunnel.localPort}`;
      headers["x-forwarded-host"] = req.headers.host || "";
      headers["x-forwarded-proto"] = "https";

      // Prepare request data
      const requestData = {
        type: "request",
        requestId,
        method: req.method,
        path: req.originalUrl,
        headers: headers,
        body: this.serializeBody(req.body),
      };

      // Send to CLI
      try {
        tunnel.ws.send(JSON.stringify(requestData));

        // Log the request
        console.log(`[${tunnel.name}] ${req.method} ${req.originalUrl}`);
      } catch (error) {
        clearTimeout(timeout);
        this.pendingRequests.delete(requestId);

        // Log connection error
        this.saveRequestLog(logData, 502, {}, "Connection failed", Date.now() - startTime);

        reject(error);
      }
    });
  }

  handleResponse(requestId: string, response: ForwardedResponse): void {
    const pending = this.pendingRequests.get(requestId);
    if (!pending) {
      console.warn(`No pending request found for ${requestId}`);
      return;
    }

    clearTimeout(pending.timeout);
    this.pendingRequests.delete(requestId);

    const duration = Date.now() - pending.startTime;

    // Decode body if it was base64 encoded
    let responseBody = response.body;
    if (
      typeof response.body === "string" &&
      response.headers["x-body-encoding"] === "base64"
    ) {
      responseBody = Buffer.from(response.body, "base64");
      delete response.headers["x-body-encoding"];
    }

    // Log the response
    this.saveRequestLog(
      pending.logData,
      response.status,
      response.headers,
      typeof responseBody === "string" ? responseBody : responseBody.toString(),
      duration
    );

    pending.resolve({
      status: response.status,
      headers: response.headers,
      body: responseBody,
    });
  }

  private filterHeaders(headers: Record<string, any>): Record<string, string> {
    const filtered: Record<string, string> = {};
    const skipHeaders = ["connection", "upgrade", "keep-alive"];

    for (const [key, value] of Object.entries(headers)) {
      if (!skipHeaders.includes(key.toLowerCase()) && value) {
        filtered[key] = Array.isArray(value) ? value.join(", ") : String(value);
      }
    }

    return filtered;
  }

  private serializeBody(body: any): string | null {
    if (!body) return null;
    if (Buffer.isBuffer(body)) {
      // Empty buffer = no body
      if (body.length === 0) return null;
      return body.toString("base64");
    }
    if (typeof body === "object") {
      // Empty object {} = no body (express.json sets this for GET requests)
      if (Object.keys(body).length === 0) return null;
      return JSON.stringify(body);
    }
    const str = String(body);
    return str.length > 0 ? str : null;
  }

  private sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    const sensitiveHeaders = ["authorization", "cookie", "x-api-key", "x-auth-token"];

    for (const [key, value] of Object.entries(headers)) {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private async saveRequestLog(
    logData: any,
    responseStatus: number,
    responseHeaders: Record<string, any>,
    responseBody: string,
    duration: number
  ): Promise<void> {
    try {
      // Truncate large response bodies
      const truncatedResponseBody = responseBody.length > 10000
        ? responseBody.substring(0, 10000) + "... [truncated]"
        : responseBody;

      const requestLog = new RequestLog({
        ...logData,
        responseStatus,
        responseHeaders: this.sanitizeHeaders(responseHeaders),
        responseBody: truncatedResponseBody,
        duration,
        timestamp: new Date(),
      });

      await requestLog.save();
    } catch (error) {
      console.error("Failed to save request log:", error);
      // Don't throw - logging failures shouldn't break request forwarding
    }
  }
}
