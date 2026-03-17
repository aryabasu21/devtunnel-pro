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
  tunnelName: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  query: Record<string, any>;
  status: number;
  duration: number;
  timestamp: string;
  userAgent?: string;
  ip?: string;
}

export interface RequestLogDetails extends RequestLog {
  headers: Record<string, any>;
  requestBody?: string;
  responseHeaders?: Record<string, any>;
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

// Get request logs
export async function getRequestLogs(params: {
  deviceId?: string;
  tunnelId?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  logs: RequestLog[];
  total: number;
  limit: number;
  offset: number;
}> {
  const searchParams = new URLSearchParams();
  if (params.deviceId) searchParams.append("deviceId", params.deviceId);
  if (params.tunnelId) searchParams.append("tunnelId", params.tunnelId);
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.offset) searchParams.append("offset", params.offset.toString());

  const response = await fetch(`${API_URL}/api/requests?${searchParams}`);
  if (!response.ok) {
    throw new Error("Failed to fetch request logs");
  }
  return response.json();
}

// Get single request log details
export async function getRequestLogDetails(id: string): Promise<RequestLogDetails> {
  const response = await fetch(`${API_URL}/api/requests/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch request log details");
  }
  return response.json();
}

// Replay a request
export async function replayRequest(id: string): Promise<{
  success: boolean;
  message: string;
  request: {
    method: string;
    path: string;
    headers: Record<string, any>;
    body?: string;
  };
}> {
  const response = await fetch(`${API_URL}/api/requests/${id}/replay`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to replay request");
  }
  return response.json();
}
