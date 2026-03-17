// API client for DevPortal Tunnel Server

const API_URL = import.meta.env.VITE_API_URL || "https://tunnel.stylnode.in";

export interface TunnelData {
  id: string;
  name: string;
  url: string;
  localPort?: number;
  status: "live" | "stopped" | "expired";
  createdAt: string;
  expiresAt?: string | null;
}

export interface RequestLog {
  id: string;
  tunnelId: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  status: number;
  duration: number;
  timestamp: string;
  headers: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
}

export interface ServerStatus {
  service: string;
  version: string;
  status: string;
  activeTunnels: number;
}

// Get server status
export async function getServerStatus(): Promise<ServerStatus> {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error("Failed to fetch server status");
  }
  return response.json();
}

// Get tunnels for a device
export async function getTunnelsByDevice(
  deviceId: string,
): Promise<TunnelData[]> {
  const response = await fetch(`${API_URL}/api/devices/${deviceId}/tunnels`);
  if (!response.ok) {
    throw new Error("Failed to fetch tunnels");
  }
  return response.json();
}

// Get single tunnel info
export async function getTunnel(tunnelId: string): Promise<TunnelData> {
  const response = await fetch(`${API_URL}/api/tunnels/${tunnelId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch tunnel");
  }
  return response.json();
}

// Health check
export async function healthCheck(): Promise<{
  status: string;
  tunnels: number;
}> {
  const response = await fetch(`${API_URL}/health`);
  if (!response.ok) {
    throw new Error("Server health check failed");
  }
  return response.json();
}
