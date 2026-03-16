import Navbar from "@/components/Navbar";
import TerminalDemo from "@/components/TerminalDemo";
import FeaturesGrid from "@/components/FeaturesGrid";
import CLICommands from "@/components/CLICommands";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Github } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

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
              <Button variant="hero" size="xl" className="w-full sm:w-auto" onClick={() => navigate("/dashboard")}>
                Open Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                <Github className="w-4 h-4" /> Star on GitHub
              </Button>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              npm install -g devportal
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
            <span className="text-foreground">npx devportal 3000</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© 2026 DevPortal. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Docs</a>
            <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
