import type { RequestLog } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Play, Copy } from "lucide-react";
import { useState } from "react";

interface Props {
  request: RequestLog | null;
}

const RequestInspector = ({ request }: Props) => {
  const [activeTab, setActiveTab] = useState<"headers" | "request" | "response">("headers");

  if (!request) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        Select a request to inspect
      </div>
    );
  }

  const tabs = ["headers", "request", "response"] as const;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <MethodBadge method={request.method} />
        <span className="font-mono text-sm text-foreground flex-1">{request.path}</span>
        <StatusBadge status={request.status} />
        <span className="text-xs text-muted-foreground">{request.duration}ms</span>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5">
          <Play className="w-3 h-3" /> Replay
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-medium capitalize transition-colors border-b-2 ${
              activeTab === tab
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "request" ? "Request Body" : tab === "response" ? "Response Body" : tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === "headers" && (
          <div className="space-y-1">
            {Object.entries(request.headers).map(([key, value]) => (
              <div key={key} className="flex font-mono text-xs">
                <span className="text-primary w-48 shrink-0">{key}:</span>
                <span className="text-foreground break-all">{value}</span>
              </div>
            ))}
            <div className="flex font-mono text-xs mt-3 pt-3 border-t border-border">
              <span className="text-muted-foreground w-48 shrink-0">Timestamp:</span>
              <span className="text-foreground">{new Date(request.timestamp).toLocaleString()}</span>
            </div>
          </div>
        )}
        {activeTab === "request" && (
          <pre className="font-mono text-xs text-foreground whitespace-pre-wrap">
            {request.requestBody
              ? JSON.stringify(JSON.parse(request.requestBody), null, 2)
              : "No request body"}
          </pre>
        )}
        {activeTab === "response" && (
          <pre className="font-mono text-xs text-foreground whitespace-pre-wrap">
            {request.responseBody
              ? JSON.stringify(JSON.parse(request.responseBody), null, 2)
              : "No response body"}
          </pre>
        )}
      </div>
    </div>
  );
};

const MethodBadge = ({ method }: { method: string }) => {
  const colors: Record<string, string> = {
    GET: "bg-success/10 text-success",
    POST: "bg-primary/10 text-primary",
    PUT: "bg-warning/10 text-warning",
    DELETE: "bg-destructive/10 text-destructive",
    PATCH: "bg-warning/10 text-warning",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${colors[method] || ""}`}>
      {method}
    </span>
  );
};

const StatusBadge = ({ status }: { status: number }) => {
  const color = status < 300 ? "bg-success/10 text-success" : status < 400 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive";
  return <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${color}`}>{status}</span>;
};

export default RequestInspector;
