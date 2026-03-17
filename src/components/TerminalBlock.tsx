import { Terminal, Copy, Check } from "lucide-react";
import { useState } from "react";

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
        <span key={index} className="text-zinc-500">
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

export default TerminalBlock;
