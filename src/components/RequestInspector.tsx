import type { RequestLog } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Play, Copy, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  request: RequestLog | null;
}

const RequestInspector = ({ request }: Props) => {
  const [activeTab, setActiveTab] = useState<"headers" | "request" | "response">("headers");
  const [replaying, setReplaying] = useState(false);
  const [editableBody, setEditableBody] = useState<string | null>(null);
  const [replayResponse, setReplayResponse] = useState<string | null>(null);

  if (!request) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-6">
        Select a request to inspect
      </div>
    );
  }

  const handleReplay = () => {
    let parsedBody: unknown = null;
    if (editableBody !== null && editableBody.trim()) {
      try {
        parsedBody = JSON.parse(editableBody);
      } catch {
        toast.error("Edited body must be valid JSON before replay");
        return;
      }
    }

    setReplaying(true);
    toast.info(`Replaying ${request.method} ${request.path}...`);
    setTimeout(() => {
      setReplayResponse(JSON.stringify({
        replayed: true,
        originalStatus: request.status,
        newStatus: 200,
        timestamp: new Date().toISOString(),
        requestBody: parsedBody,
        data: { message: "Request replayed successfully" }
      }, null, 2));
      setReplaying(false);
      setActiveTab("response");
      toast.success("Request replayed successfully");
    }, 800);
  };

  const handleCopyHeaders = () => {
    navigator.clipboard.writeText(JSON.stringify(request.headers, null, 2));
    toast.success("Headers copied to clipboard");
  };

  const handleCopyRequestBody = () => {
    if (!request.requestBody) {
      toast.info("No request body to copy");
      return;
    }

    navigator.clipboard.writeText(request.requestBody);
    toast.success("Request body copied to clipboard");
  };

  const handleCopyResponse = () => {
    const body = replayResponse || request.responseBody || "";
    navigator.clipboard.writeText(body);
    toast.success("Response copied to clipboard");
  };

  const tabs = ["headers", "request", "response"] as const;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-border flex flex-wrap items-center gap-2 sm:gap-3">
        <MethodBadge method={request.method} />
        <span className="font-mono text-xs sm:text-sm text-foreground flex-1 truncate">{request.path}</span>
        <StatusBadge status={request.status} />
        <span className="text-xs text-muted-foreground">{request.duration}ms</span>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1.5"
          onClick={handleReplay}
          disabled={replaying}
        >
          {replaying ? <RotateCcw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
          {replaying ? "Replaying..." : "Replay"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 sm:px-4 py-2 text-xs font-medium capitalize transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "request" ? "Request Body" : tab === "response" ? "Response" : tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 sm:p-4">
        {activeTab === "headers" && (
          <div className="space-y-1">
            <div className="flex items-center justify-end mb-2">
              <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1" onClick={handleCopyHeaders}>
                <Copy className="w-3 h-3" /> Copy
              </Button>
            </div>
            {Object.entries(request.headers).map(([key, value]) => (
              <div key={key} className="flex flex-col sm:flex-row font-mono text-xs gap-0.5 sm:gap-0">
                <span className="text-primary sm:w-48 shrink-0">{key}:</span>
                <span className="text-foreground break-all">{value}</span>
              </div>
            ))}
            <div className="flex flex-col sm:flex-row font-mono text-xs mt-3 pt-3 border-t border-border gap-0.5 sm:gap-0">
              <span className="text-muted-foreground sm:w-48 shrink-0">Timestamp:</span>
              <span className="text-foreground">{new Date(request.timestamp).toLocaleString()}</span>
            </div>
          </div>
        )}
        {activeTab === "request" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                {editableBody !== null ? "Editing body (edits apply on replay)" : "Request body"}
              </span>
              <div className="flex items-center gap-1">
                {request.requestBody && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px] gap-1"
                    onClick={handleCopyRequestBody}
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </Button>
                )}
                {request.requestBody && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px]"
                    onClick={() =>
                      setEditableBody(editableBody !== null ? null : (request.requestBody || ""))
                    }
                  >
                    {editableBody !== null ? "Cancel Edit" : "Edit for Replay"}
                  </Button>
                )}
              </div>
            </div>
            {editableBody !== null ? (
              <textarea
                value={editableBody}
                onChange={(e) => setEditableBody(e.target.value)}
                className="w-full h-48 bg-background border border-border rounded-md p-3 font-mono text-xs text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                spellCheck={false}
              />
            ) : (
              <pre className="font-mono text-xs text-foreground whitespace-pre-wrap">
                {request.requestBody
                  ? formatJSON(request.requestBody)
                  : "No request body"}
              </pre>
            )}
          </div>
        )}
        {activeTab === "response" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                {replayResponse ? "Replay response" : "Response body"}
              </span>
              {(replayResponse || request.responseBody) && (
                <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1" onClick={handleCopyResponse}>
                  <Copy className="w-3 h-3" /> Copy
                </Button>
              )}
            </div>
            <pre className="font-mono text-xs text-foreground whitespace-pre-wrap">
              {replayResponse
                ? replayResponse
                : request.responseBody
                  ? formatJSON(request.responseBody)
                  : "No response body"}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

const formatJSON = (str: string) => {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
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
