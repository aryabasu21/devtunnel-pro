import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import TunnelList from "@/components/TunnelList";
import ApiPlayground from "@/components/ApiPlayground";
import QRCodeModal from "@/components/QRCodeModal";
import { getTunnelsByDevice, getServerStatus, type TunnelData } from "@/lib/api";
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
  const [selectedTunnelId, setSelectedTunnelId] = useState<string | null>(null);
  const [qrTunnel, setQrTunnel] = useState<TunnelDataUI | null>(null);
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
            {/* Left panel: Tunnels + Request Log Info */}
            <div className="sm:w-[380px] lg:w-[420px] border-r border-border flex flex-col overflow-hidden shrink-0">{
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
                      <div className="p-6 text-center">
                        <div className="text-4xl mb-3">📊</div>
                        <h3 className="text-xs font-semibold mb-2">Request Logs in Terminal</h3>
                        <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">
                          View real-time request logs directly in your CLI terminal where the tunnel is running
                        </p>
                        <div className="bg-surface rounded-lg p-3 text-left max-w-sm mx-auto">
                          <p className="text-xs text-muted-foreground mb-1 font-mono">Example output:</p>
                          <code className="text-[10px] font-mono block">
                            <span className="text-success">GET</span>  /api/users        <span className="text-success">200</span>  12ms<br/>
                            <span className="text-primary">POST</span> /api/login        <span className="text-destructive">401</span>  3ms<br/>
                            <span className="text-success">GET</span>  /dashboard        <span className="text-success">200</span>  45ms
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right panel: Inspector */}
            <div className="flex-1 overflow-auto flex flex-col">{
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                  <div className="text-5xl mb-4">💻</div>
                  <h3 className="text-lg font-semibold mb-2">Terminal-First Experience</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    DevPortal streams request logs directly to your terminal for real-time visibility.
                    Keep an eye on your CLI to see incoming requests as they happen.
                  </p>
                  <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-surface px-3 py-2 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                    Logs streaming to terminal
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        ) : (
          <ApiPlayground />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
