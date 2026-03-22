import {
  Globe,
  Zap,
  Shield,
  Code2,
  Activity,
  Smartphone,
  Layers,
  Play,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Globe,
    title: "Instant Public URLs",
    desc: "Share localhost with a memorable URL in seconds. No config needed.",
  },
  {
    icon: Activity,
    title: "Live Request Inspector",
    desc: "Monitor every HTTP request in real time with headers, body, and timing.",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    desc: "JWT auth, password-protected tunnels, rate limiting, and auto-expiry.",
  },
  {
    icon: Zap,
    title: "Demo Mode",
    desc: "Create temporary share links that auto-expire. Perfect for demos.",
  },
];

const FeaturesGrid = () => (
  <section className="py-24 px-6">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl font-bold mb-3">
          Everything you need to debug
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          A complete toolkit for exposing, inspecting, and debugging your local
          development server.
        </p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="surface-card p-5 hover:border-primary/30 transition-colors group"
          >
            <f.icon className="w-5 h-5 text-primary mb-3 group-hover:text-primary transition-colors" />
            <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {f.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesGrid;
