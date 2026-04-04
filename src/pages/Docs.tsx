import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Helmet } from "react-helmet-async";
import {
  Terminal,
  Zap,
  Shield,
  Globe,
  Code,
  Layers,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";
import { useState, useEffect } from "react";

interface TerminalBlockProps {
  code: string;
  title?: string;
  showOutput?: boolean;
}

const TerminalBlock = ({
  code,
  title = "terminal",
  showOutput = false,
}: TerminalBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const commandsOnly = code
      .split("\n")
      .filter((line) => line.startsWith("$") || line.startsWith("#"))
      .map((line) => line.replace(/^\$\s*/, "").replace(/^#.*$/, ""))
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
      return (
        <span key={index} className="text-zinc-500">
          {line}
        </span>
      );
    }
    if (line.includes("→") || line.includes("✓") || line.includes("active")) {
      return (
        <span key={index} className="text-primary">
          {line}
        </span>
      );
    }
    if (line.includes("GET") || line.includes("200")) {
      return (
        <span key={index} className="text-success">
          {line}
        </span>
      );
    }
    if (
      line.includes("POST") ||
      line.includes("401") ||
      line.includes("Warning")
    ) {
      return (
        <span key={index} className="text-warning">
          {line}
        </span>
      );
    }
    if (line.includes("Error") || line.includes("DELETE")) {
      return (
        <span key={index} className="text-destructive">
          {line}
        </span>
      );
    }
    if (
      line.startsWith("│") ||
      line.startsWith("├") ||
      line.startsWith("└") ||
      line.startsWith("┌")
    ) {
      return (
        <span key={index} className="text-zinc-500 italic">
          {line}
        </span>
      );
    }
    // 🟣 JavaScript keywords
    // 🌟 Highlight LOCALHOST rule (user must edit)
    if (/localhost:\{?your-frontend-port\}?/.test(line)) {
      return (
        <span
          key={index}
          className="text-yellow-300 bg-yellow-500/10 px-1 rounded"
        >
          {line}
        </span>
      );
    }

    // 🌟 Highlight TUNNEL rule (regex-safe)
    if (/tunnel\\\.stylnode\\\.in/.test(line)) {
      return (
        <span key={index} className="text-cyan-300 bg-cyan-500/10 px-1 rounded">
          {line}
        </span>
      );
    }

    // 🟢 Success return (only specific case)
    if (line.includes("callback(null, true)")) {
      return (
        <span key={index} className="text-green-300">
          {line}
        </span>
      );
    }

    // 🔴 Error return
    if (line.includes("Not allowed by CORS")) {
      return (
        <span key={index} className="text-red-400">
          {line}
        </span>
      );
    }

    // ⚫ Comments
    if (line.trim().startsWith("//") || line.trim().startsWith("#")) {
      return (
        <span key={index} className="text-zinc-500 italic">
          {line}
        </span>
      );
    }

    // 🟣 JavaScript keywords
    if (/\b(const|return|if|require|new)\b/.test(line)) {
      return (
        <span key={index} className="text-purple-400">
          {line}
        </span>
      );
    }

    // 🟢 Strings
    if (/["']/.test(line)) {
      return (
        <span key={index} className="text-green-400">
          {line}
        </span>
      );
    }

    // 🔵 Function / logic lines
    if (line.includes("(") && line.includes(")")) {
      return (
        <span key={index} className="text-blue-400">
          {line}
        </span>
      );
    }
    return (
      <span key={index} className="text-zinc-400">
        {line}
      </span>
    );
  };

  return (
    <div className="surface-card overflow-hidden rounded-lg border border-border shadow-lg">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-gradient-to-r from-zinc-900/80 to-zinc-800/80">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
            <Terminal className="w-3 h-3" /> {title}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-zinc-800"
          title="Copy commands"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-success" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
      <pre className="bg-gradient-to-b from-zinc-950 to-black p-4 text-xs sm:text-sm font-mono leading-6 overflow-x-auto">
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
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Documentation - DevPortal Tunnel</title>
        <meta
          name="description"
          content="Learn how to use DevPortal to share your localhost, inspect traffic, replay requests, and debug APIs with comprehensive guides and examples."
        />
        <meta name="keywords" content="DevPortal documentation, tunnel setup, API testing, request inspection" />
        <link rel="canonical" href="https://devportal.stylnode.in/docs" />
      </Helmet>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            v1.0.2
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Documentation
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Everything you need to create tunnels, inspect traffic, replay
            requests, and debug APIs with DevPortal.
          </p>
        </div>

        <Tabs defaultValue="quickstart" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="quickstart" className="text-xs sm:text-sm py-2">
              Quick Start
            </TabsTrigger>
            <TabsTrigger value="cli" className="text-xs sm:text-sm py-2">
              CLI Reference
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quickstart" className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Get Started in 30 Seconds
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-medium mb-3">Install DevPortal CLI</p>
                    <Tabs defaultValue="mac" className="w-full">
                      <TabsList className="mb-3 h-8">
                        <TabsTrigger value="mac" className="text-xs px-3 h-6">
                          macOS
                        </TabsTrigger>
                        <TabsTrigger
                          value="windows"
                          className="text-xs px-3 h-6"
                        >
                          Windows
                        </TabsTrigger>
                        <TabsTrigger value="linux" className="text-xs px-3 h-6">
                          Linux
                        </TabsTrigger>
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
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-medium mb-3">
                      Start a tunnel for your local server
                    </p>
                    <TerminalBlock
                      code={`$ devportal-tunnel start 3000

Tunnel active → https://cosmic-river-847.tunnel.stylnode.in
Local server  → http://localhost:3000
Dashboard     → Open browser to inspect traffic`}
                    />
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-medium mb-3">
                      Watch incoming requests in real-time
                    </p>
                    <TerminalBlock
                      code={`GET  /api/users          200   85ms
POST /api/login          401   43ms
GET  /dashboard          200   62ms
POST /api/webhook        200   23ms`}
                    />
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/15 ring-1 ring-primary/30 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                    4
                  </div>

                  <div className="flex-1">
                    <p className="font-medium mb-3">
                      CORS Setup for Dynamic Site & DevTunnel
                    </p>

                    <p className="mb-3 text-muted-foreground text-sm">
                      Configure your backend to allow requests from your local
                      frontend and DevTunnel URLs.
                    </p>

                    {/* 🔹 Rules (NEW – improves readability a LOT) */}
                    <div className="mb-4 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <span className="text-green-400">✔</span>
                        <span>
                          Allow requests without origin{" "}
                          <span className="text-zinc-500">
                            (mobile apps, curl, Postman)
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-zinc-300">
                        <span className="text-yellow-400">●</span>
                        <span>
                          Allow{" "}
                          <code className="text-yellow-300">localhost</code>{" "}
                          with your frontend port
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-zinc-300">
                        <span className="text-cyan-400">●</span>
                        <span>
                          Allow{" "}
                          <code className="text-cyan-300">
                            *.tunnel.stylnode.in
                          </code>{" "}
                          subdomains
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-zinc-300">
                        <span className="text-purple-400">●</span>
                        <span>
                          Allow API testing tools{" "}
                          <span className="text-zinc-500">
                            (Postman, Insomnia, Thunder Client)
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-zinc-300">
                        <span className="text-red-400">✖</span>
                        <span>Block everything else (optional for development)</span>
                      </div>
                    </div>

                    <TerminalBlock
                      title="Backend (Express) – CORS configuration"
                      code={`const cors = require('cors');

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      // Allow localhost (replace with your port)
      if (origin === "http://localhost:{your-frontend-port}") {
        return callback(null, true);
      }

      // Allow DevTunnel subdomains
      if (/^https:\\/\\/[a-z0-9-]+\\.tunnel\\.stylnode\\.in$/.test(origin)) {
        return callback(null, true);
      }

      // Allow API testing tools (Postman, Insomnia, Thunder Client)
      if (origin && /postman|insomnia|thunder|localhost/.test(origin)) {
        return callback(null, true);
      }

      // Block all others
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);`}
                    />

                    {/* 🔸 Improved Callout */}
                    <div className="mt-3 text-xs border border-primary/20 bg-primary/5 px-3 py-3 rounded space-y-2">
                      <p className="text-[16px] uppercase tracking-widest text-green-400 font-normal">
                        Configuration
                      </p>
                      <p>
                        Replace{" "}
                        <code className="text-yellow-300">{`{your-frontend-port}`}</code>{" "}
                        with your frontend port:
                      </p>

                      <div className="flex flex-wrap gap-2 text-[11px]">
                        <code className="bg-zinc-800 px-2 py-1 rounded">
                          http://localhost:3000
                        </code>
                        <code className="bg-zinc-800 px-2 py-1 rounded">
                          http://localhost:5173
                        </code>
                      </div>

                      <p className="text-zinc-400">
                        ✓ The tunnel rule already allows all{" "}
                        <code className="text-cyan-300">
                          *.tunnel.stylnode.in
                        </code>{" "}
                        subdomains — no changes needed.
                      </p>

                      <p className="text-zinc-400">
                        ✓ Postman, Insomnia, Thunder Client, and other API tools are automatically allowed via the origin check.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                Test with API Tools
              </h2>
              <p className="text-muted-foreground mb-4">
                Your tunnel URL works seamlessly with Postman, Insomnia, curl, and other API testing tools.
              </p>
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Using Postman</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      <strong>Step 1:</strong> Start your tunnel and copy the URL
                    </p>
                    <TerminalBlock
                      title="terminal"
                      code={`$ devportal start 3000

Tunnel established
  Local server:  http://localhost:3000
  Public URL:    https://cosmic-river-847.tunnel.stylnode.in
  Tunnel ID:     t-abc123`}
                    />
                    <p className="text-sm text-muted-foreground">
                      <strong>Step 2:</strong> Open Postman and create a new request
                    </p>
                    <TerminalBlock
                      title="Postman - GET Request"
                      code={`Method: GET
URL: https://cosmic-river-847.tunnel.stylnode.in/api/users

Headers:
  Content-Type: application/json`}
                    />
                    <p className="text-sm text-muted-foreground">
                      <strong>Step 3:</strong> Create a POST request with body
                    </p>
                    <TerminalBlock
                      title="Postman - POST Request"
                      code={`Method: POST
URL: https://cosmic-river-847.tunnel.stylnode.in/api/users

Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "name": "John Doe",
  "email": "john@example.com"
}`}
                    />
                    <div className="mt-3 text-xs border border-primary/20 bg-primary/5 px-3 py-3 rounded">
                      <p className="text-green-400 font-semibold mb-2">✓ Password Protected Tunnels</p>
                      <p className="text-muted-foreground mb-2">If your tunnel has password protection:</p>
                      <code className="bg-zinc-800 px-2 py-1 rounded text-xs">
                        Header: X-Tunnel-Password: your-password
                      </code>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Using curl</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <TerminalBlock
                      title="terminal"
                      code={`# GET request
$ curl https://cosmic-river-847.tunnel.stylnode.in/api/users

# POST request
$ curl -X POST https://cosmic-river-847.tunnel.stylnode.in/api/users \\
  -H "Content-Type: application/json" \\
  -d '{"name":"John","email":"john@example.com"}'

# With password
$ curl https://cosmic-river-847.tunnel.stylnode.in/api/users \\
  -H "X-Tunnel-Password: secret123"`}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Supported Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Your tunnel works with any HTTP client:
                    </p>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <code className="bg-zinc-800 px-3 py-2 rounded">Postman</code>
                      <code className="bg-zinc-800 px-3 py-2 rounded">Insomnia</code>
                      <code className="bg-zinc-800 px-3 py-2 rounded">Thunder Client</code>
                      <code className="bg-zinc-800 px-3 py-2 rounded">curl</code>
                      <code className="bg-zinc-800 px-3 py-2 rounded">wget</code>
                      <code className="bg-zinc-800 px-3 py-2 rounded">fetch</code>
                    </div>
                  </CardContent>
                </Card>
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
                    <p className="text-sm text-muted-foreground">
                      Your app runs on localhost. DevPortal CLI connects and
                      creates a secure tunnel.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Layers className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">Edge Network</h3>
                    <p className="text-sm text-muted-foreground">
                      Traffic routes through our global edge for low latency and
                      high availability.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">Public URL</h3>
                    <p className="text-sm text-muted-foreground">
                      Get a unique HTTPS URL anyone can access from anywhere in
                      the world.
                    </p>
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
                    <CardTitle className="text-base font-mono">
                      devportal &lt;port&gt;
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Start a tunnel to expose your local port
                    </p>
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
                    <CardTitle className="text-base font-mono">
                      devportal-tunnel ls
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      List all active tunnels
                    </p>
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
                    <CardTitle className="text-base font-mono">
                      devportal-tunnel stop &lt;id&gt;
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Stop a specific tunnel or all tunnels
                    </p>
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
                    <CardTitle className="text-base font-mono">
                      devportal-tunnel replay &lt;request-id&gt;
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Replay a captured request from the log
                    </p>
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
        </Tabs>
      </main>
      {/* Scroll to Top Button */}
      {showScroll && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-8 z-50 p-3 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
      <Footer />
    </div>
  );
};

export default Docs;
