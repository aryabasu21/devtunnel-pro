import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import TunnelList from "@/components/TunnelList";
import RequestInspector from "@/components/RequestInspector";
import ApiPlayground from "@/components/ApiPlayground";
import QRCodeModal from "@/components/QRCodeModal";
import { getTunnelsByDevice, getServerStatus, type TunnelData, type RequestLog } from "@/lib/api";
import { toast } from "sonner";

type View = "tunnels" | "playground";

const getDeviceId = (): string => {
  const storageKey = "devportal_device_id";
  let deviceId = localStorage.getItem(storageKey);
  if (!deviceId) {
    deviceId = `dev_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(storageKey, deviceId);
  }
  return deviceId;
};

// Extended TunnelData for UI with requestCount
interface TunnelDataUI extends TunnelData {
  requestCount?: number;
}

const Dashboard = () => {
  const { deviceId: urlDeviceId } = useParams();
  const navigate = useNavigate();
  const [deviceId, setDeviceId] = useState<string>("");
  const [view, setView] = useState<View>("tunnels");
  const [tunnels, setTunnels] = useState<TunnelDataUI[]>([]);
  const [requests, setRequests] = useState<RequestLog[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RequestLog | null>(null);
  const [selectedTunnelId, setSelectedTunnelId] = useState<string | null>(null);
  const [qrTunnel, setQrTunnel] = useState<TunnelDataUI | null>(null);
  const [mobilePanel, setMobilePanel] = useState<"list" | "inspector">("list");
  const [isLoading, setIsLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState<{ status: string; activeTunnels: number } | null>(null);

  // Initialize device ID and redirect if needed
  useEffect(() => {
    const localDeviceId = getDeviceId();
    setDeviceId(localDeviceId);

    if (!urlDeviceId || urlDeviceId !== localDeviceId) {
      navigate(`/dashboard/${localDeviceId}`, { replace: true });
    }
  }, [urlDeviceId, navigate]);

  // Fetch tunnels and server status
  useEffect(() => {
    if (!deviceId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [tunnelsData, statusData] = await Promise.all([
          getTunnelsByDevice(deviceId),
          getServerStatus(),
        ]);

        const tunnelsWithCount = tunnelsData.map((t) => ({
          ...t,
          requestCount: 0,
        }));

        setTunnels(tunnelsWithCount);
        setServerStatus(statusData);

        if (tunnelsWithCount.length > 0 && !selectedTunnelId) {
          setSelectedTunnelId(tunnelsWithCount[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        // Server might be down or no tunnels yet - that's okay
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [deviceId, selectedTunnelId]);

  const filteredRequests = requests.filter((r) => r.tunnelId === selectedTunnelId);

  const handleCreateTunnel = useCallback(() => {
    toast.info(
      "To create a tunnel, run the CLI:\nnpx devportal-tunnel start <port>",
      { duration: 5000 }
    );
  }, []);

  const handleStopTunnel = useCallback((id: string) => {
    toast.info(
      "To stop a tunnel, use the CLI:\nnpx devportal-tunnel stop " + id,
      { duration: 5000 }
    );
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
        {/* Server Status Banner */}
        {serverStatus && (
          <div className="px-4 py-2 bg-surface border-b border-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${serverStatus.status === 'running' ? 'bg-success' : 'bg-destructive'}`} />
              <span className="text-muted-foreground">
                Server: <span className="text-foreground">{serverStatus.status}</span>
              </span>
            </div>
            <span className="text-muted-foreground">
              Active tunnels globally: <span className="text-foreground">{serverStatus.activeTunnels}</span>
            </span>
          </div>
        )}

        {view === "tunnels" ? (
          <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
            {/* Left panel: Tunnels + Requests */}
            <div className={`sm:w-[380px] lg:w-[420px] border-r border-border flex flex-col overflow-hidden shrink-0 ${mobilePanel === "inspector" ? "hidden sm:flex" : "flex"}`}>
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                    <p className="text-xs">Loading tunnels...</p>
                  </div>
                </div>
              ) : tunnels.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🚇</div>
                    <h3 className="text-sm font-semibold mb-2">No Active Tunnels</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Start a tunnel using the CLI to see it here
                    </p>
                    <div className="bg-surface rounded-lg p-3 text-left">
                      <p className="text-xs text-muted-foreground mb-1">Run this command:</p>
                      <code className="text-xs font-mono text-primary">
                        npx devportal-tunnel start 3000
                      </code>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <TunnelList
                    tunnels={tunnels}
                    selectedTunnelId={selectedTunnelId || ""}
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
                </>
              )}
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
              {selectedRequest ? (
                <RequestInspector request={selectedRequest} />
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                  Select a request to inspect
                </div>
              )}
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
