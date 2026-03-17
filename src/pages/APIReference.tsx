import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TerminalBlock from "@/components/TerminalBlock";
import { motion } from "framer-motion";
import { Code, Terminal, Zap, Globe, Shield, Copy } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const APIReference = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedEndpoint(endpoint);
      toast.success("Copied to clipboard!", { icon: "📋" });
      setTimeout(() => setCopiedEndpoint(null), 2000);
    });
  };

  const endpoints = [
    {
      method: "GET",
      path: "/api/devices/{deviceId}/tunnels",
      description: "Get all active tunnels for a device",
      example: `curl -X GET https://tunnel.stylnode.in/api/devices/dev_abc123_def456/tunnels`,
      response: `[
  {
    "id": "t-abc123",
    "name": "happy-tiger-a1b2c3d4",
    "url": "https://happy-tiger-a1b2c3d4.tunnel.stylnode.in",
    "status": "live",
    "createdAt": "2026-03-18T10:30:00Z"
  }
]`
    },
    {
      method: "GET",
      path: "/health",
      description: "Check server status and active tunnels count",
      example: `curl -X GET https://tunnel.stylnode.in/health`,
      response: `{
  "status": "ok",
  "tunnels": 42
}`
    },
    {
      method: "POST",
      path: "/api/tunnels/{id}/stop",
      description: "Stop a specific tunnel",
      example: `curl -X POST https://tunnel.stylnode.in/api/tunnels/t-abc123/stop`,
      response: `{
  "success": true,
  "message": "Tunnel stopped successfully"
}`
    },
    {
      method: "GET",
      path: "/api/requests",
      description: "Get request logs (with optional filtering)",
      example: `curl -X GET "https://tunnel.stylnode.in/api/requests?deviceId=dev_abc123&limit=10"`,
      response: `{
  "logs": [
    {
      "id": "req_xyz789",
      "method": "GET",
      "path": "/api/users",
      "status": 200,
      "duration": 45,
      "timestamp": "2026-03-18T10:32:15Z"
    }
  ],
  "total": 156,
  "limit": 10,
  "offset": 0
}`
    }
  ];

  const CLICommands = [
    {
      command: "devportal-tunnel start <port>",
      description: "Start a tunnel on the specified port",
      options: [
        "--subdomain <name> - Custom subdomain",
        "--password <pass> - Password protection",
        "--forward <remote:local> - Port forwarding",
        "--qr - Show QR code",
        "--demo - 2-hour expiry"
      ]
    },
    {
      command: "devportal-tunnel stop <id>",
      description: "Stop a specific tunnel",
      options: [
        "--all - Stop all tunnels"
      ]
    },
    {
      command: "devportal-tunnel stop-all",
      description: "Stop all active tunnels at once",
      options: []
    },
    {
      command: "devportal-tunnel list",
      description: "List all active tunnels",
      options: []
    },
    {
      command: "devportal-tunnel port <action>",
      description: "Manage ports",
      options: [
        "check <port> - Check port availability",
        "scan [start] - Scan for available ports",
        "list - Show all tunneled ports"
      ]
    },
    {
      command: "devportal-tunnel whoami",
      description: "Show device ID and dashboard URL",
      options: []
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">API Reference</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Complete reference for DevPortal REST API and CLI commands.
              Build powerful integrations with our tunneling service.
            </p>
          </div>

          {/* REST API Section */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Code className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">REST API Endpoints</h2>
            </div>

            <div className="space-y-8">
              {endpoints.map((endpoint, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-surface border border-border rounded-lg p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-md text-sm font-mono font-semibold ${
                      endpoint.method === 'GET' ? 'bg-success/20 text-success' :
                      endpoint.method === 'POST' ? 'bg-primary/20 text-primary' :
                      'bg-warning/20 text-warning'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-base font-mono">{endpoint.path}</code>
                  </div>

                  <p className="text-muted-foreground mb-4 text-base">{endpoint.description}</p>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold">Example Request</h4>
                      </div>
                      <TerminalBlock code={`$ ${endpoint.example}`} title={`${endpoint.method.toLowerCase()}-request`} />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold">Response</h4>
                      </div>
                      <TerminalBlock code={endpoint.response} title="json-response" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* CLI Commands Section */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Terminal className="w-5 h-5 text-success" />
              </div>
              <h2 className="text-2xl font-bold">CLI Commands</h2>
            </div>

            <div className="space-y-6">
              {CLICommands.map((cmd, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-surface border border-border rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <code className="text-base font-mono font-semibold text-primary">{cmd.command}</code>
                    <button
                      onClick={() => copyToClipboard(cmd.command, `cmd-${index}`)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedEndpoint === `cmd-${index}` ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  <p className="text-muted-foreground mb-4 text-base">{cmd.description}</p>

                  {cmd.options.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Options:</h4>
                      <ul className="space-y-1">
                        {cmd.options.map((option, optIndex) => (
                          <li key={optIndex} className="text-sm text-muted-foreground font-mono">
                            • {option}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </section>

          {/* SDK & Integration Section */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold">SDK & Integration</h2>
            </div>

            <div className="space-y-8">
              {/* JavaScript/Node.js SDK */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="bg-surface border border-border rounded-lg p-6"
              >
                <h3 className="text-xl font-semibold mb-4">JavaScript/Node.js SDK</h3>
                <p className="text-base text-muted-foreground mb-4">
                  Use DevPortal programmatically in your Node.js applications
                </p>
                <TerminalBlock
                  title="app.js"
                  code={`import { DevPortal } from 'devportal';

const tunnel = await DevPortal.connect({
  port: 3000,
  subdomain: 'my-api'
});

console.log('Public URL:', tunnel.url);

// Listen for incoming requests
tunnel.on('request', (req) => {
  console.log(req.method, req.path);
});

// Cleanup when done
await tunnel.close();`}
                />
              </motion.div>

              {/* Webhook Forwarding */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="bg-surface border border-border rounded-lg p-6"
              >
                <h3 className="text-xl font-semibold mb-4">Webhook Forwarding</h3>
                <p className="text-base text-muted-foreground mb-4">
                  Forward webhooks from services like Stripe, GitHub, or Slack to your local server
                </p>
                <TerminalBlock
                  title="webhooks"
                  code={`# Start tunnel for webhook testing
$ devportal-tunnel start 3000

Tunnel active → https://cosmic-river-847.tunnel.stylnode.in
Local server  → http://localhost:3000

# Add your tunnel URL to Stripe/GitHub/Slack dashboard
# All webhook events will forward to localhost:3000`}
                />
              </motion.div>

              {/* Environment Variables */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="bg-surface border border-border rounded-lg p-6"
              >
                <h3 className="text-xl font-semibold mb-4">Environment Variables</h3>
                <p className="text-base text-muted-foreground mb-4">
                  Configure DevPortal using environment variables
                </p>
                <TerminalBlock
                  title=".env"
                  code={`# Default port
DEVPORTAL_PORT=3000

# Custom subdomain
DEVPORTAL_SUBDOMAIN=my-project

# Auth header for all requests
DEVPORTAL_AUTH="Bearer your-token"

# Then just run:
$ devportal

✓ Using config from environment`}
                />
              </motion.div>
            </div>
          </section>

          {/* Base URL Section */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-warning" />
              </div>
              <h2 className="text-2xl font-bold">Base URL & Authentication</h2>
            </div>

            <div className="bg-surface border border-border rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-semibold mb-2">Base URL</h4>
                  <code className="text-base bg-background border border-border rounded px-3 py-2 block">
                    https://tunnel.stylnode.in
                  </code>
                </div>

                <div>
                  <h4 className="text-base font-semibold mb-2">Authentication</h4>
                  <p className="text-muted-foreground text-base">
                    DevPortal uses device-based authentication. No API keys required -
                    simply use your device ID in the request paths.
                  </p>
                </div>

                <div>
                  <h4 className="text-base font-semibold mb-2">Rate Limits</h4>
                  <ul className="text-muted-foreground text-base space-y-1">
                    <li>• API Requests: 100 requests per 15 minutes</li>
                    <li>• Tunnel Creation: 3 tunnels per IP address</li>
                    <li>• Request Logging: Automatic 7-day retention</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default APIReference;