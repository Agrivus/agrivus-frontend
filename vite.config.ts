import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Configure dev server for SPA routing
    middlewareMode: false,
  },
  preview: {
    // Configure preview server for SPA routing
    port: 4173,
  },
  build: {
    // Ensure the output is configured correctly
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("react-router-dom")) {
            return "router-vendor";
          }

          if (
            id.includes("axios") ||
            id.includes("socket.io-client") ||
            id.includes("engine.io-client")
          ) {
            return "api-vendor";
          }

          if (id.includes("react-lazy-load-image-component")) {
            return "image-vendor";
          }

          if (id.includes("react") || id.includes("scheduler")) {
            return "react-vendor";
          }

          return "vendor";
        },
      },
    },
  },
});
