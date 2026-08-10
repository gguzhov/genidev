import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { renderNoscriptFallback } from "./src/content/renderNoscriptFallback.js";

export function createNoscriptFallbackPlugin() {
  return {
    name: "noscript-content-fallback",
    transformIndexHtml(html) {
      if (html.includes('id="noscript-fallback"')) return html;

      const root = '<div id="root"></div>';
      const fallback = `<noscript id="noscript-fallback">${renderNoscriptFallback()}</noscript>`;
      return html.replace(root, `${fallback}\n    ${root}`);
    },
  };
}

export default defineConfig({
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react(), createNoscriptFallbackPlugin()],
});
