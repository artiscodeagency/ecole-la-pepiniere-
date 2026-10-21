import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { type Connect, defineConfig, type Plugin } from "vite";

// Laravel dev server (see backend/README.md).
const API_TARGET = "http://127.0.0.1:8010";

/** Serves admin.html for /admin and /admin/*, as the production .htaccess will. */
function adminEntry(): Plugin {
  const rewrite: Connect.NextHandleFunction = (req, _res, next) => {
    const [path, query] = (req.url ?? "").split("?");
    if (path === "/admin" || (path.startsWith("/admin/") && !path.includes("."))) {
      req.url = `/admin.html${query ? `?${query}` : ""}`;
    }
    next();
  };

  return {
    name: "admin-entry",
    configureServer: (server) => void server.middlewares.use(rewrite),
    configurePreviewServer: (server) => void server.middlewares.use(rewrite),
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss(), adminEntry()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    // Fixed port, allowed by the API (SANCTUM_STATEFUL_DOMAINS): the default
    // 5173 is often taken by another project.
    port: 5180,
    strictPort: true,
    proxy: {
      "/api": API_TARGET,
      "/sanctum": API_TARGET,
      // Photos uploaded in the admin (backend/public/media).
      "/media": API_TARGET,
    },
  },
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      // The public site and the admin are separate entries: neither ships the other's code.
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        admin: fileURLToPath(new URL("./admin.html", import.meta.url)),
      },
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
