import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground font-mono">D</span>
          </div>
          <span className="font-semibold text-sm">DevPortal</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            Dashboard
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Docs
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Pricing
          </Button>
          <Button size="sm" onClick={() => navigate("/dashboard")}>
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
