import { useState, useEffect } from "react";
import { Shield, AlertTriangle, Eye, Ban, Activity, Globe, Clock } from "lucide-react";
import toast from "react-hot-toast";
import StatsEndpoint from "./StatsEndpoint";

interface SecurityStats {
  totalRequests: number;
  blockedIPs: string[];
  blockedRequests: number;
  rateLimitViolations: number;
  phishingWarningsShown: number;
  activeTunnels: number;
  uniqueVisitors: number;
  lastBlockedIP?: string;
  lastBlockTime?: string;
}

interface BlockedIP {
  ip: string;
  reason: string;
  blockedAt: string;
  requestCount: number;
  expiresAt: string;
}

const SecurityDashboard = () => {
  const [stats, setStats] = useState<SecurityStats>({
    totalRequests: 1247,
    blockedIPs: ["192.168.1.100", "10.0.0.45", "203.0.113.42"],
    blockedRequests: 23,
    rateLimitViolations: 8,
    phishingWarningsShown: 156,
    activeTunnels: 3,
    uniqueVisitors: 89,
    lastBlockedIP: "203.0.113.42",
    lastBlockTime: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  });

  const [blockedIPDetails] = useState<BlockedIP[]>([
    {
      ip: "203.0.113.42",
      reason: "Rate limit exceeded (10 violations)",
      blockedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      requestCount: 1247,
      expiresAt: new Date(Date.now() + 58 * 60 * 1000).toISOString()
    },
    {
      ip: "192.168.1.100",
      reason: "Suspicious request patterns",
      blockedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      requestCount: 234,
      expiresAt: new Date(Date.now() + 45 * 60 * 1000).toISOString()
    },
    {
      ip: "10.0.0.45",
      reason: "Request size limit exceeded",
      blockedAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
      requestCount: 89,
      expiresAt: new Date(Date.now() + 28 * 60 * 1000).toISOString()
    },
  ]);

  const [phishingSettings, setPhishingSettings] = useState({
    enabled: true,
    warningDuration: 24, // hours
    apiBypass: true,
    showStats: true,
  });

  const [activeTab, setActiveTab] = useState<"overview" | "blocked-ips" | "phishing" | "stats" | "settings">("overview");

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 3),
        uniqueVisitors: prev.uniqueVisitors + (Math.random() > 0.8 ? 1 : 0),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const formatTimeUntil = (dateString: string) => {
    const diff = new Date(dateString).getTime() - Date.now();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const handleUnblockIP = (ip: string) => {
    toast.success(`Unblocked IP: ${ip}`);
    // In real implementation, this would call the API
  };

  const SecurityCard = ({ icon: Icon, title, value, subtitle, color = "text-primary" }: {
    icon: any;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }) => (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
      </div>
      <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
      {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Security Dashboard</h2>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-background rounded-lg p-1">
          {[
            { id: "overview", label: "Overview" },
            { id: "blocked-ips", label: "Blocked IPs" },
            { id: "phishing", label: "Protection" },
            { id: "stats", label: "Live Stats" },
            { id: "settings", label: "Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-surface text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <SecurityCard
                icon={Activity}
                title="Total Requests"
                value={stats.totalRequests.toLocaleString()}
                subtitle="Last 24 hours"
              />
              <SecurityCard
                icon={Ban}
                title="Blocked IPs"
                value={stats.blockedIPs.length}
                subtitle={stats.lastBlockedIP ? `Latest: ${stats.lastBlockedIP}` : "None blocked"}
                color="text-destructive"
              />
              <SecurityCard
                icon={AlertTriangle}
                title="Rate Violations"
                value={stats.rateLimitViolations}
                subtitle="Automatic blocks"
                color="text-warning"
              />
              <SecurityCard
                icon={Eye}
                title="Phishing Warnings"
                value={stats.phishingWarningsShown}
                subtitle="First-time visitors"
                color="text-primary"
              />
            </div>

            {/* Recent Security Events */}
            <div className="bg-surface border border-border rounded-lg">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-sm">Recent Security Events</h3>
              </div>
              <div className="divide-y divide-border">
                {stats.lastBlockedIP && (
                  <div className="p-4 flex items-center gap-3">
                    <Ban className="w-4 h-4 text-destructive" />
                    <div className="flex-1">
                      <div className="text-sm text-foreground">IP Blocked: {stats.lastBlockedIP}</div>
                      <div className="text-xs text-muted-foreground">Rate limit exceeded - {formatTimeAgo(stats.lastBlockTime!)}</div>
                    </div>
                  </div>
                )}
                <div className="p-4 flex items-center gap-3">
                  <Shield className="w-4 h-4 text-primary" />
                  <div className="flex-1">
                    <div className="text-sm text-foreground">Phishing protection active</div>
                    <div className="text-xs text-muted-foreground">{stats.phishingWarningsShown} warnings shown today</div>
                  </div>
                </div>
                <div className="p-4 flex items-center gap-3">
                  <Globe className="w-4 h-4 text-success" />
                  <div className="flex-1">
                    <div className="text-sm text-foreground">{stats.activeTunnels} active tunnels</div>
                    <div className="text-xs text-muted-foreground">{stats.uniqueVisitors} unique visitors</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "blocked-ips" && (
          <div className="space-y-4">
            <div className="bg-surface border border-border rounded-lg">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-sm">Currently Blocked IPs</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  IPs are automatically blocked for 1 hour after 10 violations
                </p>
              </div>
              <div className="divide-y divide-border">
                {blockedIPDetails.length > 0 ? blockedIPDetails.map((blocked, i) => (
                  <div key={i} className="p-4 flex items-center gap-3">
                    <Ban className="w-4 h-4 text-destructive flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-semibold">{blocked.ip}</span>
                        <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                          Blocked
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">{blocked.reason}</div>
                      <div className="text-xs text-muted-foreground">
                        {blocked.requestCount} requests • Blocked {formatTimeAgo(blocked.blockedAt)} •
                        Expires in {formatTimeUntil(blocked.expiresAt)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnblockIP(blocked.ip)}
                      className="px-3 py-1 text-xs bg-background border border-border rounded hover:bg-surface-hover transition-colors"
                    >
                      Unblock
                    </button>
                  </div>
                )) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No IPs currently blocked</p>
                    <p className="text-xs">Protection is active and monitoring traffic</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "phishing" && (
          <div className="space-y-6">
            {/* Phishing Protection Status */}
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <h3 className="font-semibold">Phishing Protection</h3>
                <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                  phishingSettings.enabled ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                }`}>
                  {phishingSettings.enabled ? "Active" : "Disabled"}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Warnings Shown Today</div>
                  <div className="text-2xl font-bold">{stats.phishingWarningsShown}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Warning Duration</div>
                  <div className="text-2xl font-bold">{phishingSettings.warningDuration}h</div>
                </div>
              </div>

              <div className="bg-background border border-border rounded-lg p-3">
                <h4 className="text-sm font-medium mb-2">How it works:</h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• First-time visitors see a security warning page</li>
                  <li>• Cookie-based tracking (24-hour duration)</li>
                  <li>• API requests can bypass with header: <code className="bg-surface px-1 rounded">tunnl-skip-browser-warning: 1</code></li>
                  <li>• Protects users from potential phishing tunnels</li>
                </ul>
              </div>
            </div>

            {/* API Bypass Info */}
            <div className="bg-surface border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2">API Bypass Configuration</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Allow APIs and automated tools to bypass phishing warnings
              </p>

              <div className="bg-background border border-border rounded-lg p-3 font-mono text-xs">
                <div className="text-muted-foreground mb-2"># Example API request:</div>
                <div className="text-foreground">
                  curl -H "tunnl-skip-browser-warning: 1" \<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp; https://your-tunnel.tunnel.stylnode.in/api/data
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "stats" && (
          <StatsEndpoint />
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Security Settings</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Phishing Protection</div>
                    <div className="text-xs text-muted-foreground">Show warning to first-time visitors</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={phishingSettings.enabled}
                      onChange={(e) => setPhishingSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">API Bypass</div>
                    <div className="text-xs text-muted-foreground">Allow APIs to skip warnings with header</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={phishingSettings.apiBypass}
                      onChange={(e) => setPhishingSettings(prev => ({ ...prev, apiBypass: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Warning Cookie Duration</label>
                  <select
                    value={phishingSettings.warningDuration}
                    onChange={(e) => setPhishingSettings(prev => ({ ...prev, warningDuration: parseInt(e.target.value) }))}
                    className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
                  >
                    <option value={1}>1 hour</option>
                    <option value={6}>6 hours</option>
                    <option value={12}>12 hours</option>
                    <option value={24}>24 hours</option>
                    <option value={168}>1 week</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    How long visitors remember they've seen the warning
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Rate Limiting</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Max Tunnels per IP</label>
                  <input
                    type="number"
                    defaultValue="3"
                    className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Block Duration (minutes)</label>
                  <input
                    type="number"
                    defaultValue="60"
                    className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityDashboard;