import { Globe, Code2, Settings, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

type View = "tunnels" | "playground";

interface Props {
  view: View;
  onViewChange: (v: View) => void;
  mobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

const items = [
  { id: "tunnels" as View, icon: Globe, label: "Tunnels" },
  { id: "playground" as View, icon: Code2, label: "API Playground" },
];

const DashboardSidebar = ({ view, onViewChange, mobileMenuOpen, onToggleMobileMenu }: Props) => {
  const navigate = useNavigate();

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

        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors ${
              view === item.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
            }`}
            title={item.label}
          >
            <item.icon className="w-4 h-4" />
          </button>
        ))}

        <div className="flex-1" />
        <button
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
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
              view === item.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className="w-4 h-4" />
          </button>
        ))}
      </div>
    </>
  );
};

export default DashboardSidebar;
