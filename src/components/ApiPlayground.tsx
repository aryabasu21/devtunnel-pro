import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Plus } from "lucide-react";

const endpoints = [
  { method: "GET", path: "/api/users" },
  { method: "POST", path: "/api/login" },
  { method: "GET", path: "/api/users/:id" },
  { method: "PUT", path: "/api/users/:id" },
  { method: "DELETE", path: "/api/sessions" },
];

const ApiPlayground = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState(0);
  const [requestBody, setRequestBody] = useState('{\n  "email": "test@example.com",\n  "password": "secret"\n}');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    setLoading(true);
    setTimeout(() => {
      setResponse(JSON.stringify({
        success: true,
        data: { id: 1, name: "Alice", email: "alice@example.com" },
        meta: { timestamp: new Date().toISOString(), duration: "42ms" }
      }, null, 2));
      setLoading(false);
    }, 400);
  };

  const ep = endpoints[selectedEndpoint];

  return (
    <div className="flex h-full">
      {/* Endpoint list */}
      <div className="w-56 border-r border-border overflow-auto">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Endpoints</h3>
        </div>
        <div className="divide-y divide-border">
          {endpoints.map((e, i) => (
            <button
              key={i}
              onClick={() => setSelectedEndpoint(i)}
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
      <div className="flex-1 flex flex-col border-r border-border">
        <div className="p-3 border-b border-border flex items-center gap-3">
          <MethodLabel method={ep.method} />
          <span className="font-mono text-sm text-foreground flex-1">{ep.path}</span>
          <Button size="sm" className="h-7 text-xs gap-1.5" onClick={handleSend} disabled={loading}>
            <Play className="w-3 h-3" /> {loading ? "Sending..." : "Send"}
          </Button>
        </div>
        <div className="p-3 border-b border-border">
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Headers
          </h4>
          <div className="space-y-1 font-mono text-xs">
            <div className="flex gap-2">
              <span className="text-primary">Content-Type:</span>
              <span className="text-foreground">application/json</span>
            </div>
            <div className="flex gap-2">
              <span className="text-primary">Authorization:</span>
              <span className="text-foreground">Bearer &lt;token&gt;</span>
            </div>
          </div>
        </div>
        <div className="flex-1 p-3">
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Request Body
          </h4>
          <textarea
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
            className="w-full h-48 bg-background border border-border rounded-md p-3 font-mono text-xs text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Response */}
      <div className="flex-1 flex flex-col">
        <div className="p-3 border-b border-border flex items-center gap-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Response</h3>
          {response && (
            <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded bg-success/10 text-success">
              200 OK
            </span>
          )}
        </div>
        <div className="flex-1 p-3 overflow-auto">
          {response ? (
            <pre className="font-mono text-xs text-foreground whitespace-pre-wrap">{response}</pre>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
              Send a request to see the response
            </div>
          )}
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
  return <span className={`w-12 font-semibold text-xs font-mono ${colors[method] || "text-foreground"}`}>{method}</span>;
};

export default ApiPlayground;
