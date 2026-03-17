import { motion } from "framer-motion";
import { Terminal, Copy } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const commands = [
  {
    cmd: "devportal-tunnel start <port>",
    desc: "Start a tunnel to expose localhost on the given port",
    example: "devportal-tunnel start 3000",
  },
  {
    cmd: "devportal-tunnel start <port> --demo",
    desc: "Create a temporary demo link that auto-expires in 2 hours",
    example: "devportal-tunnel start 3000 --demo",
  },
  {
    cmd: "devportal-tunnel start <port> --qr",
    desc: "Display a QR code in terminal for easy mobile sharing",
    example: "devportal-tunnel start 5173 --qr",
  },
  {
    cmd: "devportal-tunnel start <port> --password <pass>",
    desc: "Password-protect the tunnel so only authorized users can access",
    example: 'devportal-tunnel start 3000 --password secret123',
  },
  {
    cmd: "devportal-tunnel start <port> --subdomain <name>",
    desc: "Request a custom subdomain for your public URL",
    example: "devportal-tunnel start 3000 --subdomain my-app",
  },
  {
    cmd: "devportal-tunnel ls",
    desc: "List all active tunnels and their public URLs",
    example: "devportal-tunnel ls",
  },
  {
    cmd: "devportal-tunnel stop <tunnel-id>",
    desc: "Stop a specific tunnel by ID",
    example: "devportal-tunnel stop purple-horizon-218",
  },
  {
    cmd: "devportal-tunnel stop --all",
    desc: "Stop all active tunnels at once",
    example: "devportal-tunnel stop --all",
  },
];

const CLICommands = () => {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyCommand = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommand(command);
      toast.success("📋 Command copied to clipboard!", {
        duration: 2000,
        icon: "⚡",
      });
      setTimeout(() => setCopiedCommand(null), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = command;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedCommand(command);
      toast.success("📋 Command copied to clipboard!", {
        duration: 2000,
        icon: "⚡",
      });
      setTimeout(() => setCopiedCommand(null), 2000);
    }
  };

  return (
  <section className="py-20 sm:py-24 px-4 sm:px-6 border-t border-border">
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12 sm:mb-16"
      >
        <div className="inline-flex items-center gap-2 mb-4 text-primary">
          <Terminal className="w-5 h-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">CLI Reference</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">All available commands</h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
          Everything you can do from the terminal. One tool to expose, debug, and share.
        </p>
      </motion.div>
      <div className="space-y-2">
        {commands.map((c, i) => (
          <motion.div
            key={c.cmd}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03 }}
            className="surface-card p-3 sm:p-4 hover:border-primary/20 transition-colors group"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
              <div className="flex items-center gap-2 sm:w-72 shrink-0">
                <code className="text-xs sm:text-sm font-mono text-primary">
                  $ {c.cmd}
                </code>
                <button
                  onClick={() => copyCommand(c.example)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                  title="Copy example command"
                >
                  <Copy className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground flex-1">{c.desc}</span>
            </div>
            <div className="mt-2 pl-0 sm:pl-72 sm:ml-4">
              <code
                className="text-[10px] sm:text-xs font-mono text-muted-foreground/60 cursor-pointer hover:text-muted-foreground transition-colors"
                onClick={() => copyCommand(c.example)}
                title="Click to copy example"
              >
                Example: {c.example}
              </code>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
};

export default CLICommands;
