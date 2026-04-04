import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    allowedHosts: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom")
            ) {
              return "vendor";
            }
            if (
              id.includes("@radix-ui/react-dialog") ||
              id.includes("@radix-ui/react-tabs") ||
              id.includes("@radix-ui/react-accordion")
            ) {
              return "ui";
            }
            if (id.includes("framer-motion")) {
              return "animations";
            }
            if (
              id.includes("@tanstack/react-query") ||
              id.includes("react-hot-toast") ||
              id.includes("sonner")
            ) {
              return "utils";
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
}));
