import { useState, useEffect } from "react";
import { AlertTriangle, Shield, ExternalLink, Clock } from "lucide-react";

interface InterstitialWarningProps {
  tunnelUrl: string;
  tunnelName?: string;
  onProceed: () => void;
  onCancel: () => void;
}

const InterstitialWarning: React.FC<InterstitialWarningProps> = ({
  tunnelUrl,
  tunnelName,
  onProceed,
  onCancel
}) => {
  const [countdown, setCountdown] = useState(5);
  const [canProceed, setCanProceed] = useState(false);
  const [understand, setUnderstand] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanProceed(true);
    }
  }, [countdown]);

  const handleProceed = () => {
    if (!understand) return;

    // Set cookie to remember user has seen warning (24 hours)
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);
    document.cookie = `devportal_warning_seen=true; expires=${expiryDate.toUTCString()}; path=/; secure; samesite=strict`;

    onProceed();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Warning Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-warning/10 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-warning" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Security Warning</h1>
          <p className="text-sm text-muted-foreground">
            You're about to visit a development tunnel
          </p>
        </div>

        {/* Main Warning Card */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-sm mb-2">This is a development tunnel</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You're accessing <strong className="text-foreground font-mono">{tunnelName || 'a tunnel'}</strong> hosted
                through DevPortal tunneling service. This could be:
              </p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded p-3 mb-4">
            <div className="text-xs font-mono text-muted-foreground mb-1">Target URL:</div>
            <div className="text-sm font-mono text-foreground break-all">{tunnelUrl}</div>
          </div>

          <ul className="space-y-2 text-sm text-muted-foreground mb-4">
            <li className="flex items-start gap-2">
              <span className="text-success mt-1">✓</span>
              <span>A legitimate developer's local application</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-warning mt-1">⚠</span>
              <span>A potentially malicious site trying to steal your information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive mt-1">✗</span>
              <span>A phishing attempt impersonating a trusted service</span>
            </li>
          </ul>

          <div className="bg-warning/10 border border-warning/20 rounded p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-warning mb-1">Important</div>
                <div className="text-muted-foreground text-xs leading-relaxed">
                  Only proceed if you trust the person who shared this link. Never enter passwords,
                  personal information, or payment details unless you're absolutely sure this is legitimate.
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="understand"
              checked={understand}
              onChange={(e) => setUnderstand(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-2"
            />
            <label htmlFor="understand" className="text-sm text-muted-foreground cursor-pointer">
              I understand the risks and want to proceed
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-background border border-border rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            Go Back to Safety
          </button>

          <button
            onClick={handleProceed}
            disabled={!canProceed || !understand}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              canProceed && understand
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-border text-muted-foreground cursor-not-allowed"
            } flex items-center justify-center gap-2`}
          >
            {canProceed ? (
              <>
                <ExternalLink className="w-3 h-3" />
                Continue to Site
              </>
            ) : (
              <>
                <Clock className="w-3 h-3" />
                Wait {countdown}s
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            Protected by <span className="font-semibold">DevPortal Security</span> •
            This warning will be remembered for 24 hours
          </p>
        </div>
      </div>
    </div>
  );
};

// Hook to check if user should see warning
export const useInterstitialWarning = () => {
  const [shouldShowWarning, setShouldShowWarning] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if this is a browser request (not API)
    const isApiRequest =
      // Check for API bypass header (would need to be passed from server)
      window.location.search.includes('api=1') ||
      // Check user agent for common API clients
      /curl|wget|httpie|postman|insomnia/i.test(navigator.userAgent);

    if (isApiRequest) {
      setShouldShowWarning(false);
      setIsChecking(false);
      return;
    }

    // Check if user has seen warning recently (24h cookie)
    const hasSeenWarning = document.cookie
      .split(';')
      .some(cookie => cookie.trim().startsWith('devportal_warning_seen=true'));

    setShouldShowWarning(!hasSeenWarning);
    setIsChecking(false);
  }, []);

  return { shouldShowWarning, isChecking };
};

export default InterstitialWarning;