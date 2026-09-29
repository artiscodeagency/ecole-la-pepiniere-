import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const originalName = assetInfo.name || "asset";
          const safeName =
            originalName
              .toLowerCase()
              .replace(/\.[^/.]+$/, "")
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "")
              .slice(0, 80) || "asset";

          return `assets/${safeName}-[hash][extname]`;
        },
      },
    },
  },
});
