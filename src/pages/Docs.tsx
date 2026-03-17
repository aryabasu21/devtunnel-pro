import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal, Zap, Shield, Globe, Code, Layers, ArrowRight, Copy, Check } from "lucide-react";
import { useState } from "react";

interface TerminalBlockProps {
  code: string;
  title?: string;
  showOutput?: boolean;
}

const TerminalBlock = ({ code, title = "terminal", showOutput = false }: TerminalBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const commandsOnly = code
      .split("\n")
      .filter(line => line.startsWith("$") || line.startsWith("#"))
      .map(line => line.replace(/^\$\s*/, "").replace(/^#.*$/, ""))
      .filter(Boolean)
      .join("\n");
    navigator.clipboard.writeText(commandsOnly || code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatLine = (line: string, index: number) => {
    if (line.startsWith("$")) {
      return (
        <span key={index}>
          <span className="text-success">$</span>
          <span className="text-zinc-100">{line.slice(1)}</span>
        </span>
      );
    }
    if (line.startsWith("#")) {
      return <span key={index} className="text-zinc-500">{line}</span>;
    }
    if (line.includes("→") || line.includes("✓") || line.includes("active")) {
      return <span key={index} className="text-primary">{line}</span>;
    }
    if (line.includes("GET") || line.includes("200")) {
      return <span key={index} className="text-success">{line}</span>;
    }
    if (line.includes("POST") || line.includes("401") || line.includes("Warning")) {
      return <span key={index} className="text-warning">{line}</span>;
    }
    if (line.includes("Error") || line.includes("DELETE")) {
      return <span key={index} className="text-destructive">{line}</span>;
    }
    if (line.startsWith("│") || line.startsWith("├") || line.startsWith("└") || line.startsWith("┌")) {
      return <span key={index} className="text-zinc-500">{line}</span>;
    }
    return <span key={index} className="text-zinc-400">{line}</span>;
  };

  return (
    <div className="surface-card overflow-hidden rounded-lg border border-border">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-zinc-900/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/70" />
          <div className="w-3 h-3 rounded-full bg-warning/70" />
          <div className="w-3 h-3 rounded-full bg-success/70" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
            <Terminal className="w-3 h-3" /> {title}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-zinc-800"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <pre className="bg-zinc-950 p-4 text-xs sm:text-sm font-mono leading-6 overflow-x-auto">
        {code.split("\n").map((line, i) => (
          <div key={i} className="whitespace-pre">
            {formatLine(line, i)}
          </div>
        ))}
      </pre>
    </div>
  );
};

const Docs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            v1.0.0
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Documentation</h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Everything you need to create tunnels, inspect traffic, replay requests, and debug APIs with DevPortal.
          </p>
        </div>

        <Tabs defaultValue="quickstart" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="quickstart" className="text-xs sm:text-sm py-2">Quick Start</TabsTrigger>
            <TabsTrigger value="cli" className="text-xs sm:text-sm py-2">CLI Reference</TabsTrigger>
            <TabsTrigger value="dashboard" className="text-xs sm:text-sm py-2">Dashboard</TabsTrigger>
            <TabsTrigger value="api" className="text-xs sm:text-sm py-2">API Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="quickstart" className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Get Started in 30 Seconds
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">1</div>
                  <div className="flex-1">
                    <p className="font-medium mb-3">Install DevPortal CLI</p>
                    <Tabs defaultValue="mac" className="w-full">
                      <TabsList className="mb-3 h-8">
                        <TabsTrigger value="mac" className="text-xs px-3 h-6">macOS</TabsTrigger>
                        <TabsTrigger value="windows" className="text-xs px-3 h-6">Windows</TabsTrigger>
                        <TabsTrigger value="linux" className="text-xs px-3 h-6">Linux</TabsTrigger>
                      </TabsList>
                      <TabsContent value="mac" className="mt-0">
                        <TerminalBlock
                          title="terminal"
                          code={`# Quick install (installs Node.js if needed)
$ curl -fsSL https://devportal.stylnode.in/install.sh | bash

# Or using npm (if Node.js is already installed)
$ npm install -g devportal-tunnel

# Or run directly without installing
$ npx devportal-tunnel start 3000`}
                        />
                      </TabsContent>
                      <TabsContent value="windows" className="mt-0">
                        <TerminalBlock
                          title="powershell"
                          code={`# Quick install (installs Node.js if needed)
> iwr https://devportal.stylnode.in/install.ps1 -useb | iex

# Or using npm (if Node.js is already installed)
> npm install -g devportal-tunnel

# Or run directly without installing
> npx devportal-tunnel start 3000`}
                        />
                      </TabsContent>
                      <TabsContent value="linux" className="mt-0">
                        <TerminalBlock
                          title="terminal"
                          code={`# Quick install (installs Node.js if needed)
$ curl -fsSL https://devportal.stylnode.in/install.sh | bash

# Or using npm (if Node.js is already installed)
$ npm install -g devportal-tunnel

# Or run directly without installing
$ npx devportal-tunnel start 3000`}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">2</div>
                  <div className="flex-1">
                    <p className="font-medium mb-3">Start a tunnel for your local server</p>
                    <TerminalBlock
                      code={`$ devportal-tunnel start 3000

Tunnel active → https://cosmic-river-847.tunnel.stylnode.in
Local server  → http://localhost:3000
Dashboard     → Open browser to inspect traffic`}
                    />
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">3</div>
                  <div className="flex-1">
                    <p className="font-medium mb-3">Watch incoming requests in real-time</p>
                    <TerminalBlock
                      code={`GET  /api/users          200   85ms
POST /api/login          401   43ms
GET  /dashboard          200   62ms
POST /api/webhook        200   23ms`}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                How It Works
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Terminal className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">Local Server</h3>
                    <p className="text-sm text-muted-foreground">Your app runs on localhost. DevPortal CLI connects and creates a secure tunnel.</p>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Layers className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">Edge Network</h3>
                    <p className="text-sm text-muted-foreground">Traffic routes through our global edge for low latency and high availability.</p>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">Public URL</h3>
                    <p className="text-sm text-muted-foreground">Get a unique HTTPS URL anyone can access from anywhere in the world.</p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="cli" className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-primary" />
                CLI Commands
              </h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-mono">devportal &lt;port&gt;</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">Start a tunnel to expose your local port</p>
                    <TerminalBlock
                      title="devportal-tunnel"
                      code={`# Expose port 3000
$ devportal-tunnel start 3000

# Expose port 8080 with custom subdomain
$ devportal-tunnel start 8080 --subdomain my-api

# Expose with password protection
$ devportal-tunnel start 3000 --password secret123`}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-mono">devportal-tunnel ls</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">List all active tunnels</p>
                    <TerminalBlock
                      title="devportal-tunnel ls"
                      code={`$ devportal-tunnel ls

┌─────────────────────────────────────────────────────────────┐
│ ID     │ Name              │ URL                           │
├─────────────────────────────────────────────────────────────┤
│ t-847  │ cosmic-river-847  │ https://cosmic-river-847...   │
│ t-234  │ neon-lake-234     │ https://neon-lake-234...      │
└─────────────────────────────────────────────────────────────┘`}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-mono">devportal-tunnel stop &lt;id&gt;</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">Stop a specific tunnel or all tunnels</p>
                    <TerminalBlock
                      title="devportal-tunnel stop"
                      code={`# Stop specific tunnel
$ devportal-tunnel stop t-847

✓ Tunnel t-847 stopped

# Stop all tunnels
$ devportal-tunnel stop --all

✓ All tunnels stopped (2 total)`}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-mono">devportal-tunnel replay &lt;request-id&gt;</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">Replay a captured request from the log</p>
                    <TerminalBlock
                      title="devportal-tunnel replay"
                      code={`# Replay request
$ devportal-tunnel replay req-abc123

→ POST /api/webhook
← 200 OK (45ms)

# Replay with modified headers
$ devportal-tunnel replay req-abc123 --header "X-Debug: true"

# Replay with modified body
$ devportal-tunnel replay req-abc123 --body '{"updated": true}'`}
                    />
                  </CardContent>
                </Card>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Dashboard Features
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tunnel Management</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p><ArrowRight className="w-3 h-3 inline mr-2" />View all active tunnels at a glance</p>
                    <p><ArrowRight className="w-3 h-3 inline mr-2" />Copy public URLs with one click</p>
                    <p><ArrowRight className="w-3 h-3 inline mr-2" />Generate QR codes for mobile testing</p>
                    <p><ArrowRight className="w-3 h-3 inline mr-2" />Stop tunnels when debugging is done</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Request Inspector</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p><ArrowRight className="w-3 h-3 inline mr-2" />View headers, params, and body in real-time</p>
                    <p><ArrowRight className="w-3 h-3 inline mr-2" />Inspect response payloads and status codes</p>
                    <p><ArrowRight className="w-3 h-3 inline mr-2" />Filter requests by method or status</p>
                    <p><ArrowRight className="w-3 h-3 inline mr-2" />Search through request history</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Request Replay</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p><ArrowRight className="w-3 h-3 inline mr-2" />Replay any captured request</p>
                    <p><ArrowRight className="w-3 h-3 inline mr-2" />Edit headers and body before replay</p>
                    <p><ArrowRight className="w-3 h-3 inline mr-2" />Compare original vs replayed responses</p>
                    <p><ArrowRight className="w-3 h-3 inline mr-2" />Debug edge cases quickly</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">API Playground</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p><ArrowRight className="w-3 h-3 inline mr-2" />Create mock endpoints for testing</p>
                    <p><ArrowRight className="w-3 h-3 inline mr-2" />Define custom response payloads</p>
                    <p><ArrowRight className="w-3 h-3 inline mr-2" />Test webhooks without third-party setup</p>
                    <p><ArrowRight className="w-3 h-3 inline mr-2" />Perfect for demos and prototypes</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Device-Based Access
              </h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    DevPortal uses device-based identification instead of traditional login. Each device gets a unique ID stored locally, giving you instant access without account management.
                  </p>
                  <TerminalBlock
                    title="device info"
                    code={`Device ID: dev_m2abc123_4xy7z9k
Storage:   localStorage
Scope:     This browser only

# Your tunnels and settings are tied to this device ID
# Access from another browser? You'll get a new ID`}
                  />
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          <TabsContent value="api" className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                Programmatic API
              </h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">JavaScript/Node.js SDK</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">Use DevPortal programmatically in your Node.js apps</p>
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Webhook Forwarding</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">Forward webhooks from services like Stripe, GitHub, or Slack to your local server</p>
                    <TerminalBlock
                      title="webhooks"
                      code={`# Start tunnel for webhook testing
$ devportal-tunnel start 3000

Tunnel active → https://cosmic-river-847.tunnel.stylnode.in
Local server  → http://localhost:3000

# Add your tunnel URL to Stripe/GitHub/Slack dashboard
# All webhook events will forward to localhost:3000`}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Environment Variables</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">Configure DevPortal using environment variables</p>
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
                  </CardContent>
                </Card>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Docs;
