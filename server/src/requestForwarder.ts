import { Request } from "express";
import { WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import { TunnelManager, Tunnel } from "./tunnelManager";

interface PendingRequest {
  resolve: (response: ForwardedResponse) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
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
    return new Promise((resolve, reject) => {
      if (tunnel.ws.readyState !== WebSocket.OPEN) {
        reject(new Error("Tunnel connection not available"));
        return;
      }

      const requestId = uuidv4();

      // Set timeout for request
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error("Request timeout"));
      }, this.REQUEST_TIMEOUT);

      // Store pending request
      this.pendingRequests.set(requestId, { resolve, reject, timeout });

      // Prepare request data
      // Prepare headers first
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

        // 🔥 IMPORTANT FIX
        path: req.originalUrl,

        headers: headers,
        // query: req.query,
        body: this.serializeBody(req.body),
      };

      // Send to CLI
      try {
        tunnel.ws.send(JSON.stringify(requestData));

        // Log the request
        console.log(`[${tunnel.name}] ${req.method} ${req.path}`);
      } catch (error) {
        clearTimeout(timeout);
        this.pendingRequests.delete(requestId);
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

    // Decode body if it was base64 encoded
    if (
      typeof response.body === "string" &&
      response.headers["x-body-encoding"] === "base64"
    ) {
      response.body = Buffer.from(response.body, "base64");
      delete response.headers["x-body-encoding"];
    }

    pending.resolve(response);
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
}
