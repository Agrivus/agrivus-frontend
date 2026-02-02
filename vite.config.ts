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
  },
});
