import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

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
          <Button variant="ghost" size="sm" className="justify-start" onClick={() => { navigate("/dashboard"); setMenuOpen(false); }}>
            Dashboard
          </Button>
          <Button variant="ghost" size="sm" className="justify-start text-muted-foreground">
            Docs
          </Button>
          <Button variant="ghost" size="sm" className="justify-start text-muted-foreground">
            Pricing
          </Button>
          <Button size="sm" className="mt-2" onClick={() => { navigate("/dashboard"); setMenuOpen(false); }}>
            Get Started
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
