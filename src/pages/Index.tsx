import Navbar from "@/components/Navbar";
import TerminalDemo from "@/components/TerminalDemo";
import FeaturesGrid from "@/components/FeaturesGrid";
import CLICommands from "@/components/CLICommands";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Github, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const getDeviceId = (): string => {
  const storageKey = "devportal_device_id";
  let deviceId = localStorage.getItem(storageKey);
  if (!deviceId) {
    deviceId = `dev_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(storageKey, deviceId);
  }
  return deviceId;
};

const Index = () => {
  const navigate = useNavigate();
  const [deviceId, setDeviceId] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const installCommand = "npm install -g devportal-tunnel";

  useEffect(() => {
    setDeviceId(getDeviceId());
  }, []);

  const goToDashboard = () => {
    navigate(`/dashboard/${deviceId}`);
  };

  const copyInstallCommand = async () => {
    try {
      await navigator.clipboard.writeText(installCommand);
      setCopied(true);
      toast.success("Copied to clipboard! Run in your terminal to get started.", {
        icon: "📋",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = installCommand;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      toast.success("Copied to clipboard! Run in your terminal to get started.", {
        icon: "📋",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Glow effect */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: "var(--gradient-glow)" }} />

      {/* Hero */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground mb-4 sm:mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-glow" />
              Now in public beta
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-3 sm:mb-4 leading-[1.1]">
              Share localhost with
              <br />
              <span className="text-gradient">the internet</span>
            </h1>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
              Expose your local dev server with a single command. Inspect traffic, replay requests, and debug APIs — all from your terminal or dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
              <Button variant="hero" size="xl" className="w-full sm:w-auto" onClick={copyInstallCommand}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Get Started"}
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="w-full sm:w-auto"
                onClick={() => window.open("https://github.com/aryabasu21/devtunnel-pro", "_blank", "noopener,noreferrer")}
              >
                <Github className="w-4 h-4" /> Star on GitHub
              </Button>
            </div>
            <p className="text-xs text-muted-foreground font-mono bg-muted/50 inline-block px-3 py-1.5 rounded-md">
              {installCommand}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Terminal */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex justify-center"
        >
          <TerminalDemo />
        </motion.div>
      </section>

      <FeaturesGrid />

      <CLICommands />

      {/* CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to ship faster?</h2>
          <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base">
            Get a public URL for your localhost in under 10 seconds.
          </p>
          <div className="surface-card inline-block px-4 sm:px-6 py-3 font-mono text-xs sm:text-sm">
            <span className="text-muted-foreground">$ </span>
            <span className="text-foreground">devportal-tunnel start 3000</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© 2026 DevPortal. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="/docs" className="hover:text-foreground transition-colors">Docs</a>
            <a href="/support" className="hover:text-foreground transition-colors">Support</a>
            <a href="https://github.com/aryabasu21/devtunnel-pro" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
