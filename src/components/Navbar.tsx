import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, Home } from "lucide-react";

const getDeviceId = (): string => {
  const storageKey = "devportal_device_id";
  let deviceId = localStorage.getItem(storageKey);
  if (!deviceId) {
    deviceId = `dev_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(storageKey, deviceId);
  }
  return deviceId;
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deviceId, setDeviceId] = useState<string>("");

  useEffect(() => {
    setDeviceId(getDeviceId());
  }, []);

  const goToDashboard = () => {
    navigate(`/dashboard/${deviceId}`);
  };

  const goToHome = () => {
    navigate("/");
  };

  // Helper function to check if a path is active
  const isActivePath = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Helper function to get button classes based on active state
  const getNavButtonClasses = (path: string, isGhost = true) => {
    const baseClasses = isGhost ? "transition-colors" : "";
    if (isActivePath(path)) {
      return `${baseClasses} bg-primary/10 text-primary border-primary/20`;
    }
    return `${baseClasses} text-muted-foreground hover:text-foreground`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground font-mono">D</span>
          </div>
          <span className="font-semibold text-sm">DevPortal</span>
        </button>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className={getNavButtonClasses("/dashboard")}
            onClick={goToDashboard}
          >
            Dashboard
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={getNavButtonClasses("/docs")}
            onClick={() => navigate("/docs")}
          >
            Docs
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={getNavButtonClasses("/api")}
            onClick={() => navigate("/api")}
          >
            API
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={getNavButtonClasses("/examples")}
            onClick={() => navigate("/examples")}
          >
            Examples
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={getNavButtonClasses("/support")}
            onClick={() => navigate("/support")}
          >
            Support
          </Button>
          <Button size="sm" onClick={goToHome} className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Homepage
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden text-foreground p-1"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-border bg-background/95 backdrop-blur-xl px-4 py-3 flex flex-col gap-1 animate-slide-in">
          <Button
            variant="ghost"
            size="sm"
            className={`justify-start ${getNavButtonClasses("/dashboard")}`}
            onClick={() => { goToDashboard(); setMenuOpen(false); }}
          >
            Dashboard
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`justify-start ${getNavButtonClasses("/docs")}`}
            onClick={() => { navigate("/docs"); setMenuOpen(false); }}
          >
            Docs
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`justify-start ${getNavButtonClasses("/api")}`}
            onClick={() => { navigate("/api"); setMenuOpen(false); }}
          >
            API Reference
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`justify-start ${getNavButtonClasses("/examples")}`}
            onClick={() => { navigate("/examples"); setMenuOpen(false); }}
          >
            Examples
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`justify-start ${getNavButtonClasses("/support")}`}
            onClick={() => { navigate("/support"); setMenuOpen(false); }}
          >
            Support
          </Button>
          <Button
            size="sm"
            className="mt-2 justify-start flex items-center gap-2"
            onClick={() => { goToHome(); setMenuOpen(false); }}
          >
            <Home className="w-4 h-4" />
            Homepage
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
