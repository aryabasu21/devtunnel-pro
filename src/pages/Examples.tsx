import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TerminalBlock from "@/components/TerminalBlock";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  Code,
  Terminal,
  Smartphone,
  Monitor,
  Globe,
  Zap,
  Copy,
  ExternalLink,
  Play,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const Examples = () => {
  const [copiedExample, setCopiedExample] = useState<string | null>(null);

  const copyToClipboard = (text: string, example: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedExample(example);
      toast.success("Copied to clipboard!", { icon: "📋" });
      setTimeout(() => setCopiedExample(null), 2000);
    });
  };

  const useCases = [
    {
      icon: Monitor,
      title: "Local Development",
      description:
        "Share your localhost with team members or test on different devices",
      command: "devportal-tunnel start 3000",
      details:
        "Perfect for sharing React, Vue, or Angular apps running locally",
    },
    {
      icon: Globe,
      title: "Webhooks & APIs",
      description:
        "Receive webhooks from external services for local development",
      command: "devportal-tunnel start 4000 --subdomain myapi",
      details: "Get a stable URL for webhook endpoints like payment gateways",
    },
    {
      icon: Zap,
      title: "Port Forwarding",
      description: "Map different ports for complex application setups",
      command: "devportal-tunnel start 3000 --forward 8080:3000",
      details:
        "Expose local port 3000 as remote port 8080 for specific configurations",
    },
  ];

  const quickstartExamples = [
    {
      title: "React Development Server",
      description: "Share your React app with teammates for code review",
      steps: [
        "npm run dev",
        "devportal-tunnel start 3000",
        "Share the public URL with your team",
      ],
      code: `# Start your React app
npm run dev

# In another terminal, start the tunnel
devportal-tunnel start 3000

# Output:
# ✓ Tunnel established
# Local server:  http://localhost:3000
# Public URL:    https://happy-tiger-a1b2c3d4.tunnel.stylnode.in
# Tunnel ID:     t-abc123`,
    },
    {
      title: "Express API with Custom Subdomain",
      description: "Expose your Express server with a memorable URL",
      steps: [
        "Start your Express server on port 4000",
        "Use custom subdomain for easy sharing",
        "Test API endpoints from anywhere",
      ],
      code: `# Start tunnel with custom subdomain
devportal-tunnel start 4000 --subdomain myapi

# Your API is now available at:
# https://myapi.tunnel.stylnode.in

# Test your endpoints:
curl https://myapi.tunnel.stylnode.in/api/users
curl -X POST https://myapi.tunnel.stylnode.in/api/login`,
    },
    {
      title: "Webhook Development",
      description:
        "Receive webhooks from services like Stripe, GitHub, or Slack",
      steps: [
        "Create webhook endpoint in your app",
        "Start tunnel with stable subdomain",
        "Configure webhook URL in external service",
      ],
      code: `# Start your webhook server
node webhook-server.js

# Expose with stable subdomain
devportal-tunnel start 3001 --subdomain webhooks

# Use this URL in your webhook configuration:
# https://webhooks.tunnel.stylnode.in/stripe
# https://webhooks.tunnel.stylnode.in/github`,
    },
    {
      title: "Multiple Services with Port Forwarding",
      description: "Run multiple services and expose them on different ports",
      steps: [
        "Start frontend on port 3000",
        "Start API on port 4000",
        "Use port forwarding to expose both",
      ],
      code: `# Terminal 1: Frontend
npm run dev # (runs on port 3000)

# Terminal 2: API
npm run api # (runs on port 4000)

# Terminal 3: Expose frontend
devportal-tunnel start 3000

# Terminal 4: Expose API on port 8080
devportal-tunnel start 4000 --forward 8080:4000

# Now you have:
# Frontend: https://tunnel1.tunnel.stylnode.in
# API:      https://tunnel2.tunnel.stylnode.in (port 8080)`,
    },
  ];

  const advancedExamples = [
    {
      title: "CI/CD Integration",
      code: `# GitHub Actions workflow for preview deployments
name: Preview Deploy
on: [pull_request]
jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install & Build
        run: |
          npm install
          npm run build
          npm run start &
      - name: Create Tunnel
        run: |
          npx devportal-tunnel start 3000 --subdomain pr-\${{ github.event.number }}
          echo "Preview: https://pr-\${{ github.event.number }}.tunnel.stylnode.in"`,
    },
    {
      title: "Docker Integration",
      code: `# Dockerfile with tunnel support
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g devportal-tunnel
COPY . .
EXPOSE 3000
CMD ["sh", "-c", "npm start & devportal-tunnel start 3000"]

# Run with Docker
docker build -t my-app .
docker run -p 3000:3000 my-app`,
    },
    {
      title: "Load Testing Setup",
      code: `# Terminal 1: Start your app
npm run dev

# Terminal 2: Create tunnel
devportal-tunnel start 3000 --subdomain loadtest

# Terminal 3: Run load test
artillery quick --count 100 --num 10 https://loadtest.tunnel.stylnode.in

# Monitor requests in terminal 2 for real-time feedback`,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Examples - DevPortal Tunnel</title>
        <meta
          name="description"
          content="Real-world examples of using DevPortal for local development, webhook testing, API debugging, and more."
        />
        <meta name="keywords" content="DevPortal examples, use cases, webhook testing, local development" />
        <link rel="canonical" href="https://devportal.stylnode.in/examples" />
      </Helmet>
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Examples & Use Cases</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Learn how to use DevPortal for common development scenarios. From
              local testing to webhook development and mobile debugging.
            </p>
          </div>

          {/* Use Cases Overview */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Popular Use Cases</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {useCases.map((useCase, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-surface border border-border rounded-lg p-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <useCase.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">{useCase.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-base">
                      {useCase.description}
                    </p>
                    <div className="flex items-start gap-2">
                      <code className="flex-1 min-w-0 text-sm bg-background border border-border rounded px-2 py-1 overflow-x-auto whitespace-nowrap">
                        {useCase.command}
                      </code>
                      <button
                        onClick={() =>
                          copyToClipboard(useCase.command, `usecase-${index}`)
                        }
                        className="h-8 w-8 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors flex-shrink-0"
                        aria-label={`Copy command for ${useCase.title}`}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {useCase.details}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Quickstart Examples */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Play className="w-5 h-5 text-success" />
              </div>
              <h2 className="text-2xl font-bold">Quickstart Examples</h2>
            </div>

            <div className="space-y-8">
              {quickstartExamples.map((example, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-surface border border-border rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {example.title}
                      </h3>
                      <p className="text-muted-foreground text-base">
                        {example.description}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-base font-semibold mb-2">Steps:</h4>
                    <ol className="space-y-1">
                      {example.steps.map((step, stepIndex) => (
                        <li
                          key={stepIndex}
                          className="text-base text-muted-foreground"
                        >
                          {stepIndex + 1}. {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <h4 className="text-base font-semibold mb-3">
                      Code Example:
                    </h4>
                    <TerminalBlock
                      code={example.code}
                      title={example.title.toLowerCase().replace(/\s+/g, "-")}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Advanced Examples */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Code className="w-5 h-5 text-warning" />
              </div>
              <h2 className="text-2xl font-bold">Advanced Integration</h2>
            </div>

            <div className="space-y-6">
              {advancedExamples.map((example, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-surface border border-border rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{example.title}</h3>
                  </div>

                  <TerminalBlock
                    code={example.code}
                    title={example.title.toLowerCase().replace(/\s+/g, "-")}
                  />
                </motion.div>
              ))}
            </div>
          </section>

          {/* Tips & Best Practices */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Tips & Best Practices</h2>
            <div className="bg-surface border border-border rounded-lg p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    🛡️ Security Tips
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="text-base">
                      • Use password protection for sensitive applications:{" "}
                      <code className="bg-background px-2 py-1 rounded text-sm">
                        --password mypass
                      </code>
                    </li>
                    <li className="text-base">
                      • Use demo mode for temporary shares:{" "}
                      <code className="bg-background px-2 py-1 rounded text-sm">
                        --demo
                      </code>{" "}
                      (expires in 2 hours)
                    </li>
                    <li className="text-base">
                      • Be cautious when exposing database admin interfaces or
                      internal tools
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    ⚡ Performance Tips
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="text-base">
                      • Use custom subdomains for better caching:{" "}
                      <code className="bg-background px-2 py-1 rounded text-sm">
                        --subdomain myapp
                      </code>
                    </li>
                    <li className="text-base">
                      • Stop unused tunnels to free up resources:{" "}
                      <code className="bg-background px-2 py-1 rounded text-sm">
                        devportal-tunnel stop-all
                      </code>
                    </li>
                    <li className="text-base">
                      • Check port availability before starting:{" "}
                      <code className="bg-background px-2 py-1 rounded text-sm">
                        devportal-tunnel port check 3000
                      </code>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    🔧 Development Tips
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="text-base">
                      • Monitor request logs in terminal for debugging
                    </li>
                    <li className="text-base">
                      • Use port forwarding for microservice architectures
                    </li>
                    <li className="text-base">
                      • Set up webhooks with stable subdomains for consistent
                      URLs
                    </li>
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

export default Examples;
