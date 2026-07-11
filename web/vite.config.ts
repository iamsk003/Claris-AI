import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Static SPA. The backend is a separate FastAPI service reached via VITE_API_URL,
// so there is no dev proxy here — the client always talks to the configured host.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        // Split the heavy, independently-cacheable vendors so no single chunk dominates.
        manualChunks: {
          react: ["react", "react-dom"],
          charts: ["recharts"],
          motion: ["framer-motion"],
          query: ["@tanstack/react-query"],
        },
      },
    },
  },
});
