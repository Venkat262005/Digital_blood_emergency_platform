// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],

  // Fixes routing issues on Vercel
  server: {
    host: true,
    port: 5173,
  },

  // Ensures Vercel serves assets correctly
  build: {
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
  },

  // Improve speed
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
});
