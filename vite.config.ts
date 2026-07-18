import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    open: true,
    // Proxy Devpost's public API in dev so the browser can read it without CORS.
    // In a static build there's no proxy, so the app falls back to the bundled
    // snapshot (public/devpost-hackathons.json).
    proxy: {
      // Trailing slash so it only catches API calls, not static files like
      // /hackathons-snapshot.json.
      "/devpost/": {
        target: "https://devpost.com",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/devpost/, ""),
      },
    },
  },
});
