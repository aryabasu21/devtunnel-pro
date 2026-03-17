import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="sticky bottom-0 mt-auto border-t border-border bg-background z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>© {currentYear} DevPortal. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span className="font-mono text-xs bg-muted/50 px-2 py-1 rounded">
              v1.0.2-beta
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
            <a href="/status" className="hover:text-foreground transition-colors flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              Status
            </a>
          </div>
        </div>

        {/* Easter Egg */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 2 }}
          className="absolute bottom-4 right-4 text-xs text-muted-foreground/30 font-mono"
        >
          // localhost:everywhere 🌍
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;