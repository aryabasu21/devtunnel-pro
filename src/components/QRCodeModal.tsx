import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  url: string;
  tunnelName: string;
  onClose: () => void;
}

const QRCodeModal = ({ url, tunnelName, onClose }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative surface-card p-6 sm:p-8 max-w-sm w-full animate-slide-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center">
          <h3 className="font-semibold text-sm mb-1">Share Tunnel</h3>
          <p className="text-xs text-muted-foreground font-mono mb-6">{tunnelName}</p>

          <div className="bg-foreground rounded-lg p-4 inline-block mb-6">
            <QRCodeSVG
              value={url}
              size={180}
              bgColor="hsl(0, 0%, 93%)"
              fgColor="hsl(0, 0%, 4%)"
              level="M"
            />
          </div>

          <p className="text-xs text-muted-foreground mb-4 break-all font-mono">{url}</p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={handleCopy}
            >
              {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied!" : "Copy URL"}
            </Button>
            <Button
              size="sm"
              className="flex-1 gap-1.5"
              onClick={() => window.open(url, "_blank")}
            >
              <ExternalLink className="w-3 h-3" /> Open
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
