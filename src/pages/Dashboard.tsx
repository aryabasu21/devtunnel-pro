import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import TunnelList from "@/components/TunnelList";
import QRCodeModal from "@/components/QRCodeModal";
import { getTunnelsByDevice, getServerStatus, type TunnelData } from "@/lib/api";
import { detectPlatform, getStartCommand, getPlatformName } from "@/utils/platform";
import toast from "react-hot-toast";

type View = "tunnels";

const getDeviceId = (): string => {
  const storageKey = "devportal_device_id";
  let deviceId = localStorage.getItem(storageKey);
  if (!deviceId) {
    // Use same format as CLI: dev_{timestamp}_{8_hex_chars}
    const timestamp = Date.now().toString(36);
    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(4)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    deviceId = `dev_${timestamp}_${randomHex}`;
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
  const [tunnels, setTunnels] = useState<TunnelDataUI[]>([]);
  const [selectedTunnelId, setSelectedTunnelId] = useState<string | null>(null);
  const [qrTunnel, setQrTunnel] = useState<TunnelDataUI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState<{ status: string; activeTunnels: number } | null>(null);
  const [platform] = useState(() => detectPlatform());

  // Initialize device ID and redirect if needed
  useEffect(() => {
    // If URL has a device ID, use that (from CLI whoami command)
    if (urlDeviceId && urlDeviceId.startsWith('dev_')) {
      setDeviceId(urlDeviceId);
      // Store the CLI device ID in localStorage for future visits
      localStorage.setItem("devportal_device_id", urlDeviceId);
      return;
    }

    // Otherwise get/generate local device ID
    const localDeviceId = getDeviceId();
    setDeviceId(localDeviceId);

    if (!urlDeviceId || urlDeviceId !== localDeviceId) {
      navigate(`/dashboard/${localDeviceId}`, { replace: true });
    }
  }, [urlDeviceId, navigate]);

  // Fetch tunnels and server status
  useEffect(() => {
    if (!deviceId) return;

    let previousTunnelIds = new Set<string>();

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

        // Check for new tunnels and show notifications (like tunnl.gg instant feedback)
        const currentTunnelIds = new Set(tunnelsWithCount.map(t => t.id));

        if (previousTunnelIds.size > 0) {
          tunnelsWithCount.forEach(tunnel => {
            if (!previousTunnelIds.has(tunnel.id)) {
              toast.success(`🚇 New tunnel active: ${tunnel.name}\n${tunnel.url}`, {
                duration: 6000,
                icon: "⚡"
              });
            }
          });

          // Check for stopped tunnels
          previousTunnelIds.forEach(oldId => {
            if (!currentTunnelIds.has(oldId)) {
              toast.error("Tunnel stopped", {
                duration: 3000,
                icon: "⏹️"
              });
            }
          });
        }

        previousTunnelIds = currentTunnelIds;

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

    // Poll for updates every 2 seconds for instant updates (like tunnl.gg)
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [deviceId, selectedTunnelId]);

  const handleCreateTunnel = useCallback(() => {
    const startCommand = getStartCommand(platform);
    const platformName = getPlatformName(platform);

    toast(`To create a tunnel, run:\n${startCommand}`, {
      icon: "🚇",
      duration: 5000,
    });
  }, [platform]);

  const handleStopTunnel = useCallback((id: string) => {
    toast("To stop a tunnel, run:\nnpx devportal-tunnel stop " + id, {
      icon: "⏹️",
      duration: 5000,
    });
  }, []);

  return (
    <div className="h-screen flex flex-col sm:flex-row bg-background overflow-hidden">
      <DashboardSidebar deviceId={deviceId} />

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

        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          {/* Left panel: Tunnels + Request Log Info */}
          <div className="sm:w-[380px] lg:w-[420px] border-r border-border flex flex-col overflow-hidden shrink-0">
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
                  <div className="text-5xl mb-4">⚡</div>
                  <h3 className="text-lg font-semibold mb-2">Ready for Instant Tunnels</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Run a command in your terminal to see your tunnel appear here instantly
                  </p>
                  <div className="bg-surface rounded-lg p-4 text-left mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Quick start ({getPlatformName(platform)}):</p>
                    <code className="text-sm font-mono text-primary block mb-2">
                      {getStartCommand(platform)}
                    </code>
                    <p className="text-xs text-muted-foreground">
                      Your tunnel will appear here in ~2 seconds ⚡
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                    Watching for new tunnels...
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

          {/* Right panel: Terminal-First Message */}
          <div className="flex-1 overflow-auto flex flex-col">
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center max-w-md">
                <div className="text-5xl mb-4">⚡</div>
                <h3 className="text-lg font-semibold mb-2">Instant Tunnel Updates</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your tunnels appear here instantly when created from the CLI.
                  Updates every 2 seconds for real-time visibility.
                </p>
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-surface px-3 py-2 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                  Live updates active
                </div>
                <div className="mt-4 bg-surface border border-border rounded-lg p-3 text-left">
                  <p className="text-xs text-muted-foreground mb-2">Quick Commands ({getPlatformName(platform)}):</p>
                  <div className="space-y-1 font-mono text-xs">
                    <div><span className="text-primary">start:</span> <span className="text-muted-foreground">{getStartCommand(platform)}</span></div>
                    <div><span className="text-primary">list:</span> <span className="text-muted-foreground">npx devportal-tunnel ls</span></div>
                    <div><span className="text-primary">stop:</span> <span className="text-muted-foreground">npx devportal-tunnel stop &lt;id&gt;</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
