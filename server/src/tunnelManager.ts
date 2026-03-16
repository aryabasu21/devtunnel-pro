import { WebSocket } from 'ws';

export interface Tunnel {
  id: string;
  name: string;
  url: string;
  deviceId: string;
  localPort: number;
  password: string | null;
  status: 'live' | 'stopped';
  createdAt: string;
  expiresAt: string | null;
  ws: WebSocket;
}

export class TunnelManager {
  private tunnels: Map<string, Tunnel> = new Map();
  private tunnelsByName: Map<string, string> = new Map(); // name -> id
  private tunnelsByDevice: Map<string, Set<string>> = new Map(); // deviceId -> Set<tunnelId>

  addTunnel(tunnel: Tunnel): void {
    this.tunnels.set(tunnel.id, tunnel);
    this.tunnelsByName.set(tunnel.name, tunnel.id);

    if (!this.tunnelsByDevice.has(tunnel.deviceId)) {
      this.tunnelsByDevice.set(tunnel.deviceId, new Set());
    }
    this.tunnelsByDevice.get(tunnel.deviceId)!.add(tunnel.id);
  }

  getTunnel(id: string): Tunnel | undefined {
    return this.tunnels.get(id);
  }

  getTunnelByName(name: string): Tunnel | undefined {
    const id = this.tunnelsByName.get(name);
    return id ? this.tunnels.get(id) : undefined;
  }

  getTunnelsByDevice(deviceId: string): Tunnel[] {
    const ids = this.tunnelsByDevice.get(deviceId);
    if (!ids) return [];
    return Array.from(ids)
      .map(id => this.tunnels.get(id))
      .filter((t): t is Tunnel => t !== undefined);
  }

  removeTunnel(id: string): void {
    const tunnel = this.tunnels.get(id);
    if (!tunnel) return;

    this.tunnels.delete(id);
    this.tunnelsByName.delete(tunnel.name);

    const deviceTunnels = this.tunnelsByDevice.get(tunnel.deviceId);
    if (deviceTunnels) {
      deviceTunnels.delete(id);
      if (deviceTunnels.size === 0) {
        this.tunnelsByDevice.delete(tunnel.deviceId);
      }
    }

    // Close WebSocket connection
    if (tunnel.ws.readyState === WebSocket.OPEN) {
      tunnel.ws.close();
    }

    console.log(`Tunnel removed: ${tunnel.name}`);
  }

  updateTunnelStatus(id: string, status: 'live' | 'stopped'): void {
    const tunnel = this.tunnels.get(id);
    if (tunnel) {
      tunnel.status = status;
    }
  }

  getActiveTunnelCount(): number {
    return Array.from(this.tunnels.values()).filter(t => t.status === 'live').length;
  }

  getAllTunnels(): Tunnel[] {
    return Array.from(this.tunnels.values());
  }

  cleanupExpired(): void {
    const now = new Date();
    for (const tunnel of this.tunnels.values()) {
      if (tunnel.expiresAt && new Date(tunnel.expiresAt) < now) {
        console.log(`Tunnel expired: ${tunnel.name}`);
        this.removeTunnel(tunnel.id);
      }
    }
  }
}
