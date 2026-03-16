import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import TunnelList from "@/components/TunnelList";
import RequestInspector from "@/components/RequestInspector";
import ApiPlayground from "@/components/ApiPlayground";
import { mockTunnels, mockRequests, type RequestLog } from "@/lib/mock-data";

type View = "tunnels" | "playground";

const Dashboard = () => {
  const [view, setView] = useState<View>("tunnels");
  const [selectedRequest, setSelectedRequest] = useState<RequestLog | null>(mockRequests[0]);
  const [selectedTunnelId, setSelectedTunnelId] = useState("t1");

  const filteredRequests = mockRequests.filter((r) => r.tunnelId === selectedTunnelId);

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <DashboardSidebar view={view} onViewChange={setView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {view === "tunnels" ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Tunnels + Requests */}
            <div className="w-[420px] border-r border-border flex flex-col overflow-hidden">
              <TunnelList
                tunnels={mockTunnels}
                selectedTunnelId={selectedTunnelId}
                onSelectTunnel={setSelectedTunnelId}
              />
              <div className="flex-1 overflow-auto border-t border-border">
                <div className="p-3 border-b border-border">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Request Log
                  </h3>
                </div>
                <div className="divide-y divide-border">
                  {filteredRequests.map((req) => (
                    <button
                      key={req.id}
                      onClick={() => setSelectedRequest(req)}
                      className={`w-full text-left px-3 py-2.5 hover:bg-surface-hover transition-colors text-xs font-mono flex items-center gap-3 ${
                        selectedRequest?.id === req.id ? "bg-surface-hover" : ""
                      }`}
                    >
                      <MethodBadge method={req.method} />
                      <span className="text-foreground truncate flex-1">{req.path}</span>
                      <StatusBadge status={req.status} />
                      <span className="text-muted-foreground">{req.duration}ms</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Right: Inspector */}
            <div className="flex-1 overflow-auto">
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
  return <span className={`w-12 font-semibold ${colors[method] || "text-foreground"}`}>{method}</span>;
};

const StatusBadge = ({ status }: { status: number }) => {
  const color = status < 300 ? "text-success" : status < 400 ? "text-warning" : "text-destructive";
  return <span className={color}>{status}</span>;
};

export default Dashboard;
