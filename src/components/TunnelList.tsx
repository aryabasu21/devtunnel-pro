import { Copy, ExternalLink, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TunnelData } from "@/lib/mock-data";
import { useState } from "react";

interface Props {
  tunnels: TunnelData[];
  selectedTunnelId: string;
  onSelectTunnel: (id: string) => void;
}

const TunnelList = ({ tunnels, selectedTunnelId, onSelectTunnel }: Props) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Active Tunnels
        </h2>
        <Button size="sm" className="h-7 text-xs">
          + New Tunnel
        </Button>
      </div>
      <div className="space-y-2">
        {tunnels.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelectTunnel(t.id)}
            className={`w-full text-left surface-card p-3 transition-colors ${
              selectedTunnelId === t.id ? "border-primary/40" : "hover:border-border/80"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  t.status === "live" ? "bg-success animate-pulse-glow" : "bg-muted-foreground"
                }`}
              />
              <span className="text-xs font-mono text-foreground">{t.name}</span>
              {t.isDemo && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/10 text-warning font-medium">
                  DEMO
                </span>
              )}
              <span className="ml-auto text-[10px] text-muted-foreground capitalize">{t.status}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground font-mono truncate flex-1">
                :{t.localPort} → {t.url}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(t.url, t.id);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <div className="mt-1.5 text-[10px] text-muted-foreground">
              {t.requestCount} requests
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TunnelList;
