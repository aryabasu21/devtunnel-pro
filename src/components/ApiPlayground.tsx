import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Copy, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const defaultEndpoints = [
  { method: "GET", path: "/api/users" },
  { method: "POST", path: "/api/login" },
  { method: "GET", path: "/api/users/:id" },
  { method: "PUT", path: "/api/users/:id" },
  { method: "DELETE", path: "/api/sessions" },
];

const mockResponses: Record<string, { status: number; statusText: string; body: object }> = {
  "GET /api/users": { status: 200, statusText: "OK", body: { data: [{ id: 1, name: "Alice", email: "alice@example.com" }, { id: 2, name: "Bob", email: "bob@example.com" }], total: 2 } },
  "POST /api/login": { status: 200, statusText: "OK", body: { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", user: { id: 1, name: "Alice" }, expiresIn: 3600 } },
  "GET /api/users/:id": { status: 200, statusText: "OK", body: { id: 1, name: "Alice", email: "alice@example.com", role: "admin", createdAt: "2026-01-15T10:30:00Z" } },
  "PUT /api/users/:id": { status: 200, statusText: "OK", body: { id: 1, name: "Alice Updated", email: "alice@example.com", updatedAt: "2026-03-16T12:00:00Z" } },
  "DELETE /api/sessions": { status: 204, statusText: "No Content", body: {} },
};

const ApiPlayground = () => {
  const [endpoints, setEndpoints] = useState(defaultEndpoints);
  const [selectedEndpoint, setSelectedEndpoint] = useState(0);
  const [requestBody, setRequestBody] = useState('{\n  "email": "test@example.com",\n  "password": "secret"\n}');
  const [headers, setHeaders] = useState([
    { key: "Content-Type", value: "application/json" },
    { key: "Authorization", value: "Bearer <token>" },
  ]);
  const [response, setResponse] = useState<{ status: number; statusText: string; body: string; duration: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [mobileTab, setMobileTab] = useState<"endpoints" | "request" | "response">("endpoints");

  const handleSend = () => {
    setLoading(true);
    const ep = endpoints[selectedEndpoint];
    const key = `${ep.method} ${ep.path}`;
    const startTime = Date.now();

    setTimeout(() => {
      const mock = mockResponses[key] || { status: 200, statusText: "OK", body: { message: "Success" } };
      setResponse({
        status: mock.status,
        statusText: mock.statusText,
        body: JSON.stringify(mock.body, null, 2),
        duration: Date.now() - startTime + Math.floor(Math.random() * 80) + 20,
      });
      setLoading(false);
      setMobileTab("response");
      toast.success(`${ep.method} ${ep.path} → ${mock.status}`);
    }, 300 + Math.random() * 400);
  };

  const handleCopyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(response.body);
      toast.success("Response copied");
    }
  };

  const handleAddHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const ep = endpoints[selectedEndpoint];

  // Mobile tabs
  const mobileTabs = ["endpoints", "request", "response"] as const;

  return (
    <div className="flex flex-col h-full">
      {/* Mobile tab bar */}
      <div className="flex lg:hidden border-b border-border">
        {mobileTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 px-3 py-2 text-xs font-medium capitalize border-b-2 transition-colors ${
              mobileTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Endpoint list */}
        <div className={`w-full lg:w-56 border-r border-border overflow-auto flex-col ${mobileTab === "endpoints" ? "flex" : "hidden lg:flex"}`}>
          <div className="p-3 border-b border-border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Endpoints</h3>
          </div>
          <div className="divide-y divide-border flex-1">
            {endpoints.map((e, i) => (
              <button
                key={i}
                onClick={() => { setSelectedEndpoint(i); setMobileTab("request"); }}
                className={`w-full text-left px-3 py-2.5 text-xs font-mono flex items-center gap-2 transition-colors ${
                  i === selectedEndpoint ? "bg-surface-hover" : "hover:bg-surface-hover"
                }`}
              >
                <MethodLabel method={e.method} />
                <span className="text-foreground truncate">{e.path}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Request builder */}
        <div className={`flex-1 flex flex-col border-r border-border overflow-auto ${mobileTab === "request" ? "flex" : "hidden lg:flex"}`}>
          <div className="p-3 border-b border-border flex items-center gap-2 sm:gap-3">
            <MethodLabel method={ep.method} />
            <span className="font-mono text-xs sm:text-sm text-foreground flex-1 truncate">{ep.path}</span>
            <Button size="sm" className="h-7 text-xs gap-1.5" onClick={handleSend} disabled={loading}>
              {loading ? <RotateCcw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
              {loading ? "..." : "Send"}
            </Button>
          </div>
          <div className="p-3 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Headers</h4>
              <button onClick={handleAddHeader} className="text-muted-foreground hover:text-foreground">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-1.5">
              {headers.map((h, i) => (
                <div key={i} className="flex items-center gap-1.5 font-mono text-xs">
                  <input
                    value={h.key}
                    onChange={(e) => {
                      const updated = [...headers];
                      updated[i] = { ...updated[i], key: e.target.value };
                      setHeaders(updated);
                    }}
                    className="flex-1 bg-background border border-border rounded px-2 py-1 text-primary focus:outline-none focus:ring-1 focus:ring-ring min-w-0"
                    placeholder="Key"
                  />
                  <input
                    value={h.value}
                    onChange={(e) => {
                      const updated = [...headers];
                      updated[i] = { ...updated[i], value: e.target.value };
                      setHeaders(updated);
                    }}
                    className="flex-1 bg-background border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-ring min-w-0"
                    placeholder="Value"
                  />
                  <button onClick={() => handleRemoveHeader(i)} className="text-muted-foreground hover:text-destructive shrink-0">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 p-3">
            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Request Body
            </h4>
            <textarea
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              className="w-full h-32 sm:h-48 bg-background border border-border rounded-md p-3 font-mono text-xs text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Response */}
        <div className={`flex-1 flex flex-col overflow-auto ${mobileTab === "response" ? "flex" : "hidden lg:flex"}`}>
          <div className="p-3 border-b border-border flex items-center gap-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Response</h3>
            {response && (
              <>
                <span className={`ml-auto text-xs font-mono px-2 py-0.5 rounded ${
                  response.status < 300 ? "bg-success/10 text-success" : response.status < 400 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                }`}>
                  {response.status} {response.statusText}
                </span>
                <span className="text-[10px] text-muted-foreground">{response.duration}ms</span>
                <button onClick={handleCopyResponse} className="text-muted-foreground hover:text-foreground">
                  <Copy className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
          <div className="flex-1 p-3 overflow-auto">
            {response ? (
              <pre className="font-mono text-xs text-foreground whitespace-pre-wrap">{response.body}</pre>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                Send a request to see the response
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MethodLabel = ({ method }: { method: string }) => {
  const colors: Record<string, string> = {
    GET: "text-success",
    POST: "text-primary",
    PUT: "text-warning",
    DELETE: "text-destructive",
  };
  return <span className={`w-12 font-semibold text-xs font-mono shrink-0 ${colors[method] || "text-foreground"}`}>{method}</span>;
};

export default ApiPlayground;
