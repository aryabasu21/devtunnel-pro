import WebSocket from "ws";
import http from "http";
import https from "https";
import chalk from "chalk";
import { EventEmitter } from "events";

export interface TunnelConfig {
  serverUrl: string;
  wsUrl: string;
  deviceId: string;
  localPort: number;
  remotePort?: number; // For port forwarding
  subdomain?: string;
  password?: string;
  demo?: boolean;
  authHeader?: string;
}

export interface TunnelInfo {
  id: string;
  name: string;
  url: string;
  expiresAt: string | null;
}

export class TunnelClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: TunnelConfig;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private baseReconnectDelay = 1000;
  private isConnected = false;
  private tunnelInfo: TunnelInfo | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private isReconnecting = false;
  private shouldReconnect = true;

  constructor(config: TunnelConfig) {
    super();
    this.config = config;
  }

  async connect(): Promise<TunnelInfo> {
    return new Promise((resolve, reject) => {
      this.setupWebSocket(resolve, reject);
    });
  }

  private setupWebSocket(
    resolve?: (info: TunnelInfo) => void,
    reject?: (error: Error) => void
  ): void {
    try {
      // Clean up existing connection
      if (this.ws) {
        this.ws.removeAllListeners();
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.close();
        }
      }

      this.ws = new WebSocket(this.config.wsUrl);

      this.ws.on("open", () => {
        this.isConnected = true;
        this.isReconnecting = false;
        this.reconnectAttempts = 0;

        // Register tunnel
        this.send({
          type: "register",
          deviceId: this.config.deviceId,
          localPort: this.config.localPort,
          remotePort: this.config.remotePort, // Include remote port for forwarding
          subdomain: this.tunnelInfo?.name || this.config.subdomain, // Reuse same subdomain on reconnect
          password: this.config.password,
          demo: this.config.demo,
        });

        // Start ping interval (every 15 seconds to keep connection alive)
        this.startPingInterval();
      });

      this.ws.on("message", async (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(message, resolve, reject);
        } catch (error) {
          console.error("Failed to parse message:", error);
        }
      });

      this.ws.on("close", (code, reason) => {
        this.isConnected = false;
        this.stopPingInterval();

        if (!this.shouldReconnect) {
          this.emit("disconnected");
          return;
        }

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        } else {
          console.log(chalk.red("\nMax reconnection attempts reached. Tunnel stopped."));
          console.log(chalk.gray("Run the command again to start a new tunnel."));
          this.emit("disconnected");
          process.exit(1);
        }
      });

      this.ws.on("error", (error) => {
        if (!this.isConnected && !this.isReconnecting && reject) {
          reject(error);
        }
        this.emit("error", error);
      });

    } catch (error) {
      if (reject) reject(error as Error);
    }
  }

  private scheduleReconnect(): void {
    if (this.isReconnecting) return;
    this.isReconnecting = true;
    this.reconnectAttempts++;

    // Exponential backoff with jitter: 1s, 2s, 4s, 8s... up to 30s max
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1) + Math.random() * 1000,
      30000
    );

    console.log(chalk.yellow(`\nConnection lost. Reconnecting in ${Math.round(delay / 1000)}s... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`));

    setTimeout(() => {
      this.emit("reconnecting", this.reconnectAttempts);
      this.setupWebSocket();
    }, delay);
  }

  private startPingInterval(): void {
    this.stopPingInterval();
    this.pingInterval = setInterval(() => {
      if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: "ping" });
      }
    }, 15000); // Ping every 15 seconds
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private async handleMessage(
    message: any,
    resolve?: (info: TunnelInfo) => void,
    reject?: (error: Error) => void,
  ): Promise<void> {
    switch (message.type) {
      case "registered": {
        const wasReconnect = this.tunnelInfo !== null;
        this.tunnelInfo = message.tunnel;
        this.emit("registered", message.tunnel);
        if (wasReconnect) {
          console.log(chalk.green(`\nReconnected! Tunnel restored: ${message.tunnel.url}`));
          this.emit("reconnected", message.tunnel);
        } else if (resolve) {
          resolve(message.tunnel);
        }
        break;
      }

      case "request":
        await this.handleIncomingRequest(message);
        break;

      case "error":
        console.error(chalk.red("Server error:"), message.message);
        if (reject) reject(new Error(message.message));
        break;

      case "pong":
        // Connection alive
        break;

      case "stopped":
        this.emit("stopped", message.tunnelId);
        break;
    }
  }

  private async handleIncomingRequest(message: any): Promise<void> {
    const { requestId, method, path, headers, body } = message;

    this.emit("request", { method, path, requestId });

    const safePath = path && path !== "undefined" ? path : "/";
    const url = `http://localhost:${this.config.localPort}${safePath}`;

    const requestHeaders: Record<string, string> = {
      ...headers,
      host: `localhost:${this.config.localPort}`,
    };

    // Remove headers that cause issues with local dev servers
    delete requestHeaders["content-length"];
    delete requestHeaders["transfer-encoding"];
    delete requestHeaders["connection"];
    delete requestHeaders["sec-fetch-site"];
    delete requestHeaders["sec-fetch-mode"];
    delete requestHeaders["sec-fetch-dest"];
    delete requestHeaders["sec-fetch-user"];
    delete requestHeaders["origin"];
    delete requestHeaders["referer"];
    // Remove forwarding headers — Vite's DNS rebinding check rejects x-forwarded-host
    // if it doesn't match an allowed host
    delete requestHeaders["x-forwarded-host"];
    delete requestHeaders["x-forwarded-proto"];
    delete requestHeaders["x-forwarded-for"];
    if (this.config.authHeader) {
      const [key, value] = this.config.authHeader.split(": ");
      if (key && value) {
        requestHeaders[key] = value;
      }
    }

    try {
      const response = await this.makeLocalRequest(
        method,
        url,
        requestHeaders,
        body,
      );
      this.emit("response", {
        method,
        path,
        status: response.status,
        requestId,
      });

      // Send response back to server
      this.send({
        type: "response",
        requestId,
        status: response.status,
        headers: response.headers,
        body: response.body,
      });
    } catch (error: any) {
      this.emit("error", error);

      // Send error response
      this.send({
        type: "response",
        requestId,
        status: 502,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          error: "Failed to connect to local server",
          message: error.message,
        }),
      });
    }
  }

  private makeLocalRequest(
    method: string,
    url: string,
    headers: Record<string, string>,
    body: string | null,
  ): Promise<{
    status: number;
    headers: Record<string, string>;
    body: string;
  }> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);

      const options: http.RequestOptions = {
        hostname: urlObj.hostname,
        port: Number(urlObj.port) || this.config.localPort,
        path: urlObj.pathname + urlObj.search,
        method,
        headers,
        timeout: 30000,
      };

      const req = http.request(options, (res) => {
        const chunks: Buffer[] = [];

        res.on("data", (chunk: Buffer) => chunks.push(chunk));

        res.on("end", () => {
          const bodyBuffer = Buffer.concat(chunks);
          const responseHeaders: Record<string, string> = {};
          // Convert headers
          for (const [key, value] of Object.entries(res.headers)) {
            if (value) {
              responseHeaders[key] = Array.isArray(value)
                ? value.join(", ")
                : value;
            }
          }

          // 🔥 CRITICAL FIX (add this BELOW the loop)
          delete responseHeaders["content-length"];
          delete responseHeaders["transfer-encoding"];
          delete responseHeaders["connection"];

          // Check if body is binary
          const contentType = responseHeaders["content-type"] || "";
          const isBinary =
            !contentType.includes("text") &&
            !contentType.includes("json") &&
            !contentType.includes("xml") &&
            !contentType.includes("javascript");

          let bodyString: string;
          if (isBinary) {
            bodyString = bodyBuffer.toString("base64");
            responseHeaders["x-body-encoding"] = "base64";
          } else {
            bodyString = bodyBuffer.toString("utf-8");
          }

          resolve({
            status: res.statusCode || 500,
            headers: responseHeaders,
            body: bodyString,
          });
        });
      });

      req.on("error", reject);
      req.on("timeout", () => reject(new Error("Request timeout")));

      if (body) {
        // Only decode as base64 if it was encoded that way (binary content)
        const bodyEncoding = headers?.["x-body-encoding"];
        const bodyBuffer = bodyEncoding === "base64"
          ? Buffer.from(body, "base64")
          : Buffer.from(body, "utf-8");
        req.write(bodyBuffer);
      }

      req.end();
    });
  }

  private send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  stop(): void {
    this.shouldReconnect = false;
    this.stopPingInterval();
    if (this.tunnelInfo) {
      this.send({ type: "stop", tunnelId: this.tunnelInfo.id });
    }
    this.ws?.close();
  }

  getTunnelInfo(): TunnelInfo | null {
    return this.tunnelInfo;
  }
}
