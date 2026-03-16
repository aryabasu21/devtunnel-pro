export interface TunnelData {
  id: string;
  name: string;
  url: string;
  localPort: number;
  status: "live" | "stopped" | "expired";
  createdAt: string;
  requestCount: number;
  isDemo?: boolean;
  expiresAt?: string;
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

export const mockTunnels: TunnelData[] = [
  {
    id: "t1",
    name: "purple-horizon-218",
    url: "https://purple-horizon-218.devportal.live",
    localPort: 3000,
    status: "live",
    createdAt: "2026-03-16T10:30:00Z",
    requestCount: 247,
  },
  {
    id: "t2",
    name: "cosmic-lake-472",
    url: "https://cosmic-lake-472.devportal.live",
    localPort: 5173,
    status: "live",
    createdAt: "2026-03-16T09:15:00Z",
    requestCount: 89,
  },
  {
    id: "t3",
    name: "sunset-forest-182",
    url: "https://demo.devportal.live/sunset-forest-182",
    localPort: 8080,
    status: "expired",
    createdAt: "2026-03-15T14:00:00Z",
    requestCount: 34,
    isDemo: true,
    expiresAt: "2026-03-15T16:00:00Z",
  },
];

export const mockRequests: RequestLog[] = [
  {
    id: "r1", tunnelId: "t1", method: "GET", path: "/api/users", status: 200, duration: 85,
    timestamp: "2026-03-16T12:45:32Z",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer eyJhbG..." },
    responseBody: '[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]',
  },
  {
    id: "r2", tunnelId: "t1", method: "POST", path: "/api/login", status: 401, duration: 43,
    timestamp: "2026-03-16T12:45:28Z",
    headers: { "Content-Type": "application/json" },
    requestBody: '{"email":"test@example.com","password":"***"}',
    responseBody: '{"error":"Invalid credentials"}',
  },
  {
    id: "r3", tunnelId: "t1", method: "GET", path: "/dashboard", status: 200, duration: 62,
    timestamp: "2026-03-16T12:45:20Z",
    headers: { "Accept": "text/html" },
  },
  {
    id: "r4", tunnelId: "t1", method: "PUT", path: "/api/users/1", status: 200, duration: 120,
    timestamp: "2026-03-16T12:44:55Z",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer eyJhbG..." },
    requestBody: '{"name":"Alice Updated"}',
    responseBody: '{"id":1,"name":"Alice Updated"}',
  },
  {
    id: "r5", tunnelId: "t1", method: "DELETE", path: "/api/sessions/old", status: 204, duration: 31,
    timestamp: "2026-03-16T12:44:40Z",
    headers: { "Authorization": "Bearer eyJhbG..." },
  },
  {
    id: "r6", tunnelId: "t2", method: "GET", path: "/", status: 200, duration: 15,
    timestamp: "2026-03-16T12:43:00Z",
    headers: { "Accept": "text/html" },
  },
];
