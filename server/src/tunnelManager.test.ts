import assert from "node:assert/strict";
import test from "node:test";
import { TunnelManager, type Tunnel } from "./tunnelManager";
import type { WebSocket } from "ws";

function createSocket(): WebSocket {
  return { readyState: 0 } as WebSocket;
}

function createTunnel(
  manager: TunnelManager,
  overrides: Partial<Tunnel> = {},
): Tunnel {
  const tunnel: Tunnel = {
    id: overrides.id || "t-test",
    name: overrides.name || "test-tunnel",
    url: overrides.url || "https://test.example",
    deviceId: overrides.deviceId || "dev-test",
    clientIp: overrides.clientIp || "127.0.0.1",
    localPort: overrides.localPort || 3000,
    password: null,
    status: "live",
    createdAt: new Date().toISOString(),
    expiresAt: overrides.expiresAt || null,
    ws: overrides.ws || createSocket(),
  };

  manager.addTunnel(tunnel);
  return tunnel;
}

test("finds tunnels by their owning WebSocket", () => {
  const manager = new TunnelManager();
  const ws = createSocket();
  const tunnel = createTunnel(manager, { ws });

  assert.deepEqual(manager.getTunnelsByWebSocket(ws), [tunnel]);
  assert.equal(manager.getTunnelByWebSocket(ws)?.id, tunnel.id);
});

test("removes every tunnel owned by a WebSocket", () => {
  const manager = new TunnelManager();
  const ws = createSocket();
  createTunnel(manager, { ws, id: "t-one", name: "one" });
  createTunnel(manager, { ws, id: "t-two", name: "two" });

  const removed = manager.removeTunnelsByWebSocket(ws);

  assert.deepEqual(removed.map((tunnel) => tunnel.id).sort(), ["t-one", "t-two"]);
  assert.equal(manager.getAllTunnels().length, 0);
});

test("returns and removes expired tunnels", () => {
  const manager = new TunnelManager();
  const expired = createTunnel(manager, {
    expiresAt: new Date(Date.now() - 1000).toISOString(),
  });
  createTunnel(manager, { id: "t-live", name: "live" });

  const removed = manager.cleanupExpired();

  assert.deepEqual(removed.map((tunnel) => tunnel.id), [expired.id]);
  assert.equal(manager.getTunnel(expired.id), undefined);
  assert.equal(manager.getTunnel("t-live")?.status, "live");
});
