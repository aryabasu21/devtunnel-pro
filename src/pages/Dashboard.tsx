import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import TunnelList from "@/components/TunnelList";
import RequestInspector from "@/components/RequestInspector";
import ApiPlayground from "@/components/ApiPlayground";
import QRCodeModal from "@/components/QRCodeModal";
import { mockTunnels as initialTunnels, mockRequests as initialRequests, type RequestLog, type TunnelData } from "@/lib/mock-data";
import { toast } from "sonner";

type View = "tunnels" | "playground";

const adjectives = ["purple", "cosmic", "hidden", "crystal", "silent", "golden", "frozen", "blazing", "lunar", "neon"];
const nouns = ["horizon", "lake", "forest", "ocean", "canyon", "river", "meadow", "summit", "valley", "storm"];

const generateTunnelName = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj}-${noun}-${num}`;
};

const getDeviceId = (): string => {
  const storageKey = "devportal_device_id";
  let deviceId = localStorage.getItem(storageKey);
  if (!deviceId) {
    deviceId = `dev_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(storageKey, deviceId);
  }
  return deviceId;
};

const Dashboard = () => {
  const { deviceId: urlDeviceId } = useParams();
  const navigate = useNavigate();
  const [deviceId, setDeviceId] = useState<string>("");
  const [view, setView] = useState<View>("tunnels");
  const [tunnels, setTunnels] = useState<TunnelData[]>(initialTunnels);
  const [requests, setRequests] = useState<RequestLog[]>(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<RequestLog | null>(initialRequests[0]);
  const [selectedTunnelId, setSelectedTunnelId] = useState("t1");
  const [qrTunnel, setQrTunnel] = useState<TunnelData | null>(null);
  const [mobilePanel, setMobilePanel] = useState<"list" | "inspector">("list");

  useEffect(() => {
    const localDeviceId = getDeviceId();
    setDeviceId(localDeviceId);

    // If no deviceId in URL or mismatched, redirect to correct URL
    if (!urlDeviceId || urlDeviceId !== localDeviceId) {
      navigate(`/dashboard/${localDeviceId}`, { replace: true });
    }
  }, [urlDeviceId, navigate]);

  const filteredRequests = requests.filter((r) => r.tunnelId === selectedTunnelId);

  const handleCreateTunnel = useCallback(() => {
    const name = generateTunnelName();
    const newTunnel: TunnelData = {
      id: `t${Date.now()}`,
      name,
      url: `https://${name}.devportal.live`,
      localPort: 3000 + Math.floor(Math.random() * 5000),
      status: "live",
      createdAt: new Date().toISOString(),
      requestCount: 0,
    };
    setTunnels((prev) => [newTunnel, ...prev]);
    setSelectedTunnelId(newTunnel.id);
    toast.success(`Tunnel ${name} created`);
  }, []);

  const handleStopTunnel = useCallback((id: string) => {
    setTunnels((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "stopped" as const } : t))
    );
    toast.info("Tunnel stopped");
  }, []);

  const handleSelectRequest = (req: RequestLog) => {
    setSelectedRequest(req);
    setMobilePanel("inspector");
  };

  return (
    <div className="h-screen flex flex-col sm:flex-row bg-background overflow-hidden">
      <DashboardSidebar view={view} onViewChange={setView} deviceId={deviceId} />

      {qrTunnel && (
        <QRCodeModal
          url={qrTunnel.url}
          tunnelName={qrTunnel.name}
          onClose={() => setQrTunnel(null)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {view === "tunnels" ? (
          <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
            {/* Left panel: Tunnels + Requests */}
            <div className={`sm:w-[380px] lg:w-[420px] border-r border-border flex flex-col overflow-hidden shrink-0 ${mobilePanel === "inspector" ? "hidden sm:flex" : "flex"}`}>
              <TunnelList
                tunnels={tunnels}
                selectedTunnelId={selectedTunnelId}
                onSelectTunnel={setSelectedTunnelId}
                onCreateTunnel={handleCreateTunnel}
                onStopTunnel={handleStopTunnel}
                onShowQR={(t) => setQrTunnel(t)}
              />
              <div className="flex-1 overflow-auto border-t border-border">
                <div className="p-3 border-b border-border">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Request Log
                  </h3>
                </div>
                <div className="divide-y divide-border">
                  {filteredRequests.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground">
                      No requests yet for this tunnel
                    </div>
                  ) : (
                    filteredRequests.map((req) => (
                      <button
                        key={req.id}
                        onClick={() => handleSelectRequest(req)}
                        className={`w-full text-left px-3 py-2.5 hover:bg-surface-hover transition-colors text-xs font-mono flex items-center gap-2 sm:gap-3 ${
                          selectedRequest?.id === req.id ? "bg-surface-hover" : ""
                        }`}
                      >
                        <MethodBadge method={req.method} />
                        <span className="text-foreground truncate flex-1">{req.path}</span>
                        <StatusBadge status={req.status} />
                        <span className="text-muted-foreground shrink-0">{req.duration}ms</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right panel: Inspector */}
            <div className={`flex-1 overflow-auto ${mobilePanel === "list" ? "hidden sm:flex sm:flex-col" : "flex flex-col"}`}>
              {/* Mobile back button */}
              <button
                className="sm:hidden p-3 border-b border-border text-xs text-primary font-medium"
                onClick={() => setMobilePanel("list")}
              >
                ← Back to requests
              </button>
              <RequestInspector request={selectedRequest} />
            </div>
          </div>
        ) : (
          <ApiPlayground />
        )}
      </div>
    </div>
  );
};

const MethodBadge = ({ method }: { method: string }) => {
  const colors: Record<string, string> = {
    GET: "text-success",
    POST: "text-primary",
    PUT: "text-warning",
    DELETE: "text-destructive",
    PATCH: "text-warning",
  };
  return <span className={`w-10 sm:w-12 font-semibold shrink-0 ${colors[method] || "text-foreground"}`}>{method}</span>;
};

const StatusBadge = ({ status }: { status: number }) => {
  const color = status < 300 ? "text-success" : status < 400 ? "text-warning" : "text-destructive";
  return <span className={`shrink-0 ${color}`}>{status}</span>;
};

export default Dashboard;
