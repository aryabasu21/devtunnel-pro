import { motion } from "framer-motion";
import { Terminal, Copy, Check } from "lucide-react";
import { useState } from "react";

const lines = [
  { text: "$ npx devportal-tunnel@latest", delay: 0, color: "text-muted-foreground" },
  { text: "$ devportal start 3000", delay: 0.3, color: "text-foreground" },
  { text: "", delay: 0.6, color: "" },
  { text: "╔═══════════════════════════════════════╗", delay: 0.7, color: "text-primary/60" },
  { text: "║  DevPortal - Share localhost instantly  ║", delay: 0.75, color: "text-primary/60" },
  { text: "╚═══════════════════════════════════════╝", delay: 0.8, color: "text-primary/60" },
  { text: "", delay: 0.9, color: "" },
  { text: "✓ Tunnel established", delay: 1.0, color: "text-success" },
  { text: "", delay: 1.1, color: "" },
  { text: "  Local server:  http://localhost:3000", delay: 1.2, color: "text-muted-foreground" },
  { text: "  Public URL:    https://purple-horizon-218.tunnel.stylnode.in", delay: 1.4, color: "text-primary" },
  { text: "  Tunnel ID:     t-f8a448a7", delay: 1.6, color: "text-muted-foreground" },
  { text: "", delay: 1.8, color: "" },
  { text: "  Dashboard:     https://devportal.stylnode.in/dashboard/dev_abc123", delay: 1.9, color: "text-muted-foreground" },
  { text: "", delay: 2.0, color: "" },
  { text: "  Forwarding requests... (Press Ctrl+C to stop)", delay: 2.1, color: "text-muted-foreground" },
  { text: "", delay: 2.3, color: "" },
  { text: "3:45:12 PM GET   /api/users        200", delay: 2.6, color: "text-success" },
  { text: "3:45:14 PM POST  /api/auth         401", delay: 3.0, color: "text-warning" },
  { text: "3:45:16 PM GET   /dashboard        200", delay: 3.4, color: "text-success" },
  { text: "", delay: 3.8, color: "", cursor: true },
];

const TerminalDemo = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("npx devportal-tunnel@latest");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="surface-card overflow-hidden max-w-2xl w-full shadow-2xl shadow-black/20">
      <div className="flex items-center gap-2 px-3 sm:px-4 py-3 border-b border-border bg-gradient-to-r from-zinc-900/80 to-zinc-800/80">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
            <Terminal className="w-3 h-3" /> devportal-tunnel
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-zinc-800"
          title="Copy install command"
        >
          {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="bg-gradient-to-b from-zinc-950 to-black p-3 sm:p-4 font-mono text-[11px] sm:text-sm leading-6 sm:leading-7 min-h-[320px] sm:min-h-[380px] overflow-x-auto">
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: line.delay, duration: 0.05 }}
            className={`${line.color} whitespace-nowrap flex items-center`}
          >
            <span>{line.text || "\u00A0"}</span>
            {line.cursor && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  delay: line.delay + 0.1,
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="inline-block w-2 h-4 bg-primary/80 ml-1"
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TerminalDemo;
