import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8099"
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src")
    }
  }
});
