import { useState, useEffect } from "react";
import { Activity, Users, Shield, Globe, Clock, TrendingUp } from "lucide-react";

// Enhanced API to include security metrics
export interface EnhancedServerStats {
  status: string;
  activeTunnels: number;
  totalRequests: number;
  uniqueIPs: number;
  blockedIPs: number;
  rateLimitViolations: number;
  phishingWarningsShown: number;
  averageResponseTime: number;
  uptime: number;
  requestsPerSecond: number;
}

export const StatsEndpoint = () => {
  const [stats, setStats] = useState<EnhancedServerStats>({
    status: "running",
    activeTunnels: 3,
    totalRequests: 1247,
    uniqueIPs: 89,
    blockedIPs: 3,
    rateLimitViolations: 8,
    phishingWarningsShown: 156,
    averageResponseTime: 45,
    uptime: 142800, // seconds
    requestsPerSecond: 2.3,
  });

  const [realtimeData, setRealtimeData] = useState<{ timestamp: string; value: number }[]>([]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 5),
        uniqueIPs: prev.uniqueIPs + (Math.random() > 0.9 ? 1 : 0),
        requestsPerSecond: Math.max(0.1, prev.requestsPerSecond + (Math.random() - 0.5) * 0.5),
        averageResponseTime: Math.max(10, prev.averageResponseTime + (Math.random() - 0.5) * 10),
        uptime: prev.uptime + 5,
      }));

      // Update real-time chart data
      const now = new Date().toISOString();
      setRealtimeData(prev => {
        const newData = [...prev, { timestamp: now, value: Math.random() * 10 }];
        return newData.slice(-20); // Keep last 20 points
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color = "text-primary" }: {
    icon: any;
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: "up" | "down" | "neutral";
    color?: string;
  }) => (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        {trend && (
          <div className={`flex items-center text-xs ${
            trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground"
          }`}>
            <TrendingUp className={`w-3 h-3 ${trend === "down" ? "rotate-180" : ""}`} />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
      {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
    </div>
  );

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Live Statistics</h2>
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          Live updates every 5 seconds
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Globe}
          title="Active Tunnels"
          value={stats.activeTunnels}
          subtitle="Currently running"
          trend="up"
        />
        <StatCard
          icon={Activity}
          title="Total Requests"
          value={stats.totalRequests.toLocaleString()}
          subtitle={`${stats.requestsPerSecond.toFixed(1)}/sec`}
          trend="up"
        />
        <StatCard
          icon={Users}
          title="Unique Visitors"
          value={stats.uniqueIPs}
          subtitle="Last 24 hours"
          trend="up"
        />
        <StatCard
          icon={Shield}
          title="Blocked IPs"
          value={stats.blockedIPs}
          subtitle={`${stats.rateLimitViolations} violations`}
          color="text-destructive"
          trend="neutral"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard
          icon={Clock}
          title="Avg Response Time"
          value={`${stats.averageResponseTime}ms`}
          subtitle="All tunnels"
          trend={stats.averageResponseTime < 50 ? "up" : "down"}
        />
        <StatCard
          icon={Shield}
          title="Phishing Warnings"
          value={stats.phishingWarningsShown}
          subtitle="Shown to visitors"
          color="text-warning"
          trend="up"
        />
        <StatCard
          icon={Activity}
          title="Server Uptime"
          value={formatUptime(stats.uptime)}
          subtitle="Current session"
          color="text-success"
          trend="up"
        />
      </div>

      {/* Real-time Activity Chart */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Real-time Activity
        </h3>
        <div className="h-32 flex items-end gap-1 overflow-hidden">
          {realtimeData.map((point, i) => (
            <div
              key={i}
              className="bg-primary/20 border-t-2 border-primary flex-1 transition-all duration-300"
              style={{ height: `${Math.max(4, (point.value / 10) * 100)}%` }}
              title={`${point.value.toFixed(1)} req/s at ${new Date(point.timestamp).toLocaleTimeString()}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Past 2 minutes</span>
          <span>Requests per second</span>
        </div>
      </div>

      {/* JSON Stats Export (tunnl.gg style) */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <h3 className="font-semibold text-sm mb-4">Raw Stats (JSON)</h3>
        <div className="bg-background border border-border rounded p-3 font-mono text-xs overflow-auto max-h-48">
          <pre className="text-muted-foreground">
{JSON.stringify({
  service: "devportal-tunnel",
  version: "1.0.2",
  status: stats.status,
  timestamp: new Date().toISOString(),
  metrics: {
    tunnels: {
      active: stats.activeTunnels,
      total_lifetime: stats.activeTunnels + 47, // simulate some history
    },
    requests: {
      total: stats.totalRequests,
      per_second: parseFloat(stats.requestsPerSecond.toFixed(2)),
      avg_response_time_ms: stats.averageResponseTime,
    },
    security: {
      unique_ips: stats.uniqueIPs,
      blocked_ips: stats.blockedIPs,
      rate_limit_violations: stats.rateLimitViolations,
      phishing_warnings_shown: stats.phishingWarningsShown,
    },
    server: {
      uptime_seconds: stats.uptime,
      memory_usage_mb: Math.floor(Math.random() * 100 + 50),
      cpu_usage_percent: Math.floor(Math.random() * 30 + 5),
    }
  }
}, null, 2)}
          </pre>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          💡 Access this data at <code className="bg-background px-1 rounded">GET /stats</code> endpoint
        </div>
      </div>
    </div>
  );
};

export default StatsEndpoint;