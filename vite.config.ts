import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: parseInt(process.env.PORT || "8080"),
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Motokah",
        short_name: "Motokah",
        description: "Find Your Perfect Ride Across Africa",
        theme_color: "#0066CC",
        background_color: "#0F0F0F",
        // Motokah has real iOS/Android apps now, so the website is no longer offered as an
        // installable web app ("Add to Home Screen"). Browsers that support it point to the
        // Play Store app instead.
        display: "browser",
        start_url: "/",
        prefer_related_applications: true,
        related_applications: [
          { platform: "play", url: "https://play.google.com/store/apps/details?id=com.motokah.app", id: "com.motokah.app" },
        ],
        icons: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: ["**/*.{css,html,ico,png,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
      },
    }),
  ].filter(Boolean),
  optimizeDeps: {
    include: ["remotion", "@remotion/player"],
  },
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react": path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
  },
}));
