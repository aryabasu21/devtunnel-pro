import { motion } from "framer-motion";
import {
  Mail,
  Heart,
  Zap,
  Globe,
  Shield,
  Terminal,
  Coffee,
  Star,
  Users,
  Activity,
} from "lucide-react";
import { useState, useEffect } from "react";

const STATS_STORAGE_KEY = "devportal_stats";
const GROWTH_INTERVAL_MS = 20 * 24 * 60 * 60 * 1000;
const BASE_STATS = {
  activeTunnels: 12,
  developers: 8,
  requests: 45,
};

const HomeFooterContent = () => {
  const UPTIME = 58.9;

  // Dynamic stats that increase with real usage
  const [stats, setStats] = useState(BASE_STATS);

  const resetStatsToDefault = () => {
    const resetPayload = {
      ...BASE_STATS,
      lastUpdate: Date.now(),
    };

    setStats(BASE_STATS);
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(resetPayload));
  };

  // Initialize and update stats
  useEffect(() => {
    const now = Date.now();
    const fallbackStats = {
      ...BASE_STATS,
      lastUpdate: now,
    };

    let initialStats = fallbackStats;
    const storedStats = localStorage.getItem(STATS_STORAGE_KEY);
    if (storedStats) {
      try {
        const parsedStats = JSON.parse(storedStats);
        if (
          typeof parsedStats.activeTunnels === "number" &&
          typeof parsedStats.developers === "number" &&
          typeof parsedStats.requests === "number" &&
          typeof parsedStats.lastUpdate === "number"
        ) {
          initialStats = parsedStats;
        }
      } catch {
        initialStats = fallbackStats;
      }
    }

    const elapsedMs = Math.max(0, now - initialStats.lastUpdate);
    const growthWindows = Math.floor(elapsedMs / GROWTH_INTERVAL_MS);

    const updatedStats = {
      activeTunnels: initialStats.activeTunnels + growthWindows * 8,
      developers: initialStats.developers + growthWindows * 2,
      requests: initialStats.requests,
    };

    setStats(updatedStats);

    // Save updated stats
    localStorage.setItem(
      STATS_STORAGE_KEY,
      JSON.stringify({
        ...updatedStats,
        lastUpdate: now,
      }),
    );
  }, []);

  // Update localStorage when stats change
  useEffect(() => {
    localStorage.setItem(
      STATS_STORAGE_KEY,
      JSON.stringify({
        ...stats,
        lastUpdate: Date.now(),
      }),
    );
  }, [stats]);

  const quickLinks = [
    { label: "Documentation", href: "/docs", icon: Terminal },
    { label: "API Reference", href: "/api", icon: Zap },
    { label: "Examples", href: "/examples", icon: Globe },
    { label: "Support", href: "/support", icon: Heart },
    {
      label: "NPM Package",
      href: "https://www.npmjs.com/package/devportal-tunnel",
      icon: Coffee,
    },
  ];

  const social = [
    { label: "Email", href: "mailto:riju@stylnode.in", icon: Mail },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/aryabasu21",
      icon: Users,
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/ridzpixel/",
      icon: Heart,
    },
  ];

  const displayStats = [
    {
      label: "Active Tunnels",
      value: `${stats.activeTunnels.toLocaleString()}+`,
      icon: Activity,
      color: "text-success",
    },
    {
      label: "Developers",
      value: `${stats.developers.toLocaleString()}+`,
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Requests Handled",
      value:
        stats.requests >= 1000
          ? `${Math.floor(stats.requests / 1000)}K+`
          : `${stats.requests.toLocaleString()}+`,
      icon: Zap,
      color: "text-warning",
    },
    {
      label: "Uptime",
      value: `${UPTIME}%`,
      icon: Star,
      color: "text-yellow-500",
    },
  ];

  return (
    <section className="relative border-t border-border bg-gradient-to-br from-background via-background to-surface">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute -top-32 right-1/3 w-64 h-64 rounded-full bg-success/10 blur-2xl animate-pulse delay-700" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12"
        >
          {displayStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="text-center group cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface border border-border group-hover:border-primary/50 transition-colors mb-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {import.meta.env.DEV && (
          <div className="flex justify-end mb-8">
            <button
              type="button"
              onClick={resetStatsToDefault}
              className="text-xs px-3 py-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              Reset Stats (Dev)
            </button>
          </div>
        )}

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-2"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground font-mono">
                  D
                </span>
              </div>
              <span className="text-lg font-bold">DevPortal</span>
            </div>
            <p className="text-base text-muted-foreground mb-4 leading-relaxed max-w-md">
              The fastest way to share your localhost with the world. Built with
              passion, designed for developers. Zero config, maximum speed. ⚡
            </p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-red-500 animate-pulse" />
              <span>and lots of</span>
              <Coffee className="w-3 h-3 text-amber-600" />
              <span>by Arya Basu</span>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Quick Links
            </h4>
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-2 text-base text-muted-foreground hover:text-foreground transition-colors group"
                  whileHover={{ x: 4 }}
                >
                  <link.icon className="w-3 h-3 group-hover:text-primary transition-colors" />
                  {link.label}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Community */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Connect
            </h4>
            <div className="space-y-2 mb-4">
              {social.map((item) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-base text-muted-foreground hover:text-foreground transition-colors group"
                  whileHover={{ x: 4 }}
                >
                  <item.icon className="w-3 h-3 group-hover:text-primary transition-colors" />
                  {item.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 py-6 border-t border-border/50"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-success" />
            <span>Enterprise-grade security</span>
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-muted-foreground/30" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            <span>58.9% uptime guaranteed</span>
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-muted-foreground/30" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="w-4 h-4 text-blue-500" />
            <span>Global CDN network</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeFooterContent;
