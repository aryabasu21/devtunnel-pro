import { motion } from "framer-motion";
import { Terminal, Copy, Check } from "lucide-react";
import { useState } from "react";

const lines = [
  { text: "$ npm install -g devportal", delay: 0, color: "text-muted-foreground" },
  { text: "$ devportal 3000", delay: 0.3, color: "text-foreground" },
  { text: "", delay: 0.6, color: "" },
  { text: "🚀 DevPortal tunnel established", delay: 0.8, color: "text-foreground" },
  { text: "", delay: 1, color: "" },
  { text: "  Local server:  http://localhost:3000", delay: 1.1, color: "text-muted-foreground" },
  { text: "  Public URL:    https://purple-horizon-218.devportal.live", delay: 1.3, color: "text-primary" },
  { text: "", delay: 1.5, color: "" },
  { text: "  Share this link with anyone to access your local app.", delay: 1.6, color: "text-muted-foreground" },
  { text: "", delay: 1.8, color: "" },
  { text: "GET  /api/users          200   85ms", delay: 2.2, color: "text-success" },
  { text: "POST /api/login          401   43ms", delay: 2.6, color: "text-warning" },
  { text: "GET  /dashboard          200   62ms", delay: 3.0, color: "text-success" },
];

const TerminalDemo = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("npm install -g devportal");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="surface-card overflow-hidden max-w-2xl w-full">
      <div className="flex items-center gap-2 px-3 sm:px-4 py-3 border-b border-border">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/70" />
          <div className="w-3 h-3 rounded-full bg-warning/70" />
          <div className="w-3 h-3 rounded-full bg-success/70" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
            <Terminal className="w-3 h-3" /> terminal
          </span>
        </div>
        <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="p-3 sm:p-4 font-mono text-[11px] sm:text-sm leading-6 sm:leading-7 min-h-[280px] sm:min-h-[340px] overflow-x-auto">
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: line.delay, duration: 0.05 }}
            className={`${line.color} whitespace-nowrap`}
          >
            {line.text || "\u00A0"}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TerminalDemo;
