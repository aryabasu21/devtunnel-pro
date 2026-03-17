import { Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  deviceId?: string;
  mobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

const DashboardSidebar = ({ deviceId, mobileMenuOpen, onToggleMobileMenu }: Props) => {
  const navigate = useNavigate();

  const copyDeviceId = () => {
    if (deviceId) {
      navigator.clipboard.writeText(deviceId);
      toast.success("Device ID copied to clipboard");
    }
  };

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden sm:flex w-14 bg-card border-r border-border flex-col items-center py-3 gap-1 shrink-0">
        <button
          onClick={() => navigate("/")}
          className="w-8 h-8 rounded bg-primary flex items-center justify-center mb-4"
        >
          <span className="text-xs font-bold text-primary-foreground font-mono">D</span>
        </button>

        <div className="flex-1" />

        {deviceId && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={copyDeviceId}
                className="w-10 h-10 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors mb-1"
              >
                <User className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[200px]">
              <p className="text-xs font-medium mb-1">Device ID</p>
              <p className="text-[10px] font-mono text-muted-foreground break-all">{deviceId}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Click to copy</p>
            </TooltipContent>
          </Tooltip>
        )}

        <button
          onClick={() => toast.success("Settings panel coming soon!")}
          className="w-10 h-10 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile top bar */}
      <div className="sm:hidden flex items-center h-12 px-3 border-b border-border bg-card gap-2 shrink-0">
        <button
          onClick={() => navigate("/")}
          className="w-7 h-7 rounded bg-primary flex items-center justify-center"
        >
          <span className="text-[10px] font-bold text-primary-foreground font-mono">D</span>
        </button>
        <span className="text-xs font-semibold flex-1">DevPortal</span>
        {deviceId && (
          <button
            onClick={copyDeviceId}
            className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground"
            title={`Device: ${deviceId}`}
          >
            <User className="w-4 h-4" />
          </button>
        )}
      </div>
    </>
  );
};

export default DashboardSidebar;
