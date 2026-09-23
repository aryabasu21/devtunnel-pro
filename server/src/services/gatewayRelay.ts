import Redis from "ioredis";
import {
  instanceId,
  redisConnectionUrl,
} from "./redisPresence";
import type { ForwardedResponse } from "../requestForwarder";

export interface GatewayRequest {
  requestId: string;
  originInstanceId: string;
  tunnelId: string;
  method: string;
  path: string;
  headers: Record<string, string>;
  body: string | null;
}

interface PendingRelay {
  resolve: (response: ForwardedResponse) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

const REQUEST_TIMEOUT_MS = 30_000;

function requestChannel(targetInstanceId: string): string {
  return `devportal:gateway:requests:${targetInstanceId}`;
}

function responseChannel(instance: string): string {
  return `devportal:gateway:responses:${instance}`;
}

export class GatewayRelay {
  private publisher: Redis | null = null;
  private subscriber: Redis | null = null;
  private readonly pendingOrigin = new Map<string, PendingRelay>();
  private readonly pendingOwner = new Map<string, PendingRelay>();
  private started = false;

  async start(
    handleRequest: (
      request: GatewayRequest,
      sendToTunnel: (request: GatewayRequest) => Promise<ForwardedResponse>,
    ) => Promise<ForwardedResponse>,
  ): Promise<void> {
    if (!redisConnectionUrl || this.started) return;

    this.publisher = new Redis(redisConnectionUrl);
    this.subscriber = new Redis(redisConnectionUrl);
    this.subscriber.on("message", (channel, message) => {
      void this.handleMessage(channel, message, handleRequest);
    });
    await this.subscriber.subscribe(
      requestChannel(instanceId),
      responseChannel(instanceId),
    );
    this.started = true;
  }

  requestRemote(
    targetInstanceId: string,
    request: GatewayRequest,
  ): Promise<ForwardedResponse> {
    if (!this.publisher || !this.started) {
      return Promise.reject(new Error("Gateway relay is unavailable"));
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingOrigin.delete(request.requestId);
        reject(new Error("Remote tunnel gateway timeout"));
      }, REQUEST_TIMEOUT_MS);
      this.pendingOrigin.set(request.requestId, { resolve, reject, timeout });
      void this.publisher!.publish(
        requestChannel(targetInstanceId),
        JSON.stringify(request),
      ).catch((error) => {
        clearTimeout(timeout);
        this.pendingOrigin.delete(request.requestId);
        reject(error);
      });
    });
  }

  handleTunnelResponse(requestId: string, response: ForwardedResponse): boolean {
    const pending = this.pendingOwner.get(requestId);
    if (!pending) return false;
    clearTimeout(pending.timeout);
    this.pendingOwner.delete(requestId);
    pending.resolve(response);
    return true;
  }

  private async handleMessage(
    channel: string,
    message: string,
    handleRequest: (
      request: GatewayRequest,
      sendToTunnel: (request: GatewayRequest) => Promise<ForwardedResponse>,
    ) => Promise<ForwardedResponse>,
  ): Promise<void> {
    let parsed: GatewayRequest | ForwardedResponse & { requestId: string };
    try {
      parsed = JSON.parse(message) as typeof parsed;
    } catch {
      return;
    }

    if (channel === responseChannel(instanceId)) {
      const pending = this.pendingOrigin.get(parsed.requestId);
      if (!pending) return;
      clearTimeout(pending.timeout);
      this.pendingOrigin.delete(parsed.requestId);
      pending.resolve(parsed as ForwardedResponse);
      return;
    }

    const request = parsed as GatewayRequest;
    const sendToTunnel = (tunnelRequest: GatewayRequest): Promise<ForwardedResponse> =>
      new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.pendingOwner.delete(tunnelRequest.requestId);
          reject(new Error("Local tunnel gateway timeout"));
        }, REQUEST_TIMEOUT_MS);
        this.pendingOwner.set(tunnelRequest.requestId, { resolve, reject, timeout });
      });

    try {
      const response = await handleRequest(request, sendToTunnel);
      await this.respondToOrigin(request, response);
    } catch (error) {
      await this.respondToOrigin(request, {
        status: 502,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ error: "Remote tunnel forwarding failed" }),
      });
      console.error("Gateway request failed:", error);
    }
  }

  async respondToOrigin(
    request: GatewayRequest,
    response: ForwardedResponse,
  ): Promise<void> {
    if (!this.publisher) return;
    await this.publisher.publish(
      responseChannel(request.originInstanceId),
      JSON.stringify({ requestId: request.requestId, ...response }),
    );
  }

  async close(): Promise<void> {
    await Promise.all([
      this.publisher?.quit(),
      this.subscriber?.quit(),
    ]);
    this.publisher = null;
    this.subscriber = null;
    this.started = false;
  }
}

export const gatewayRelay = new GatewayRelay();