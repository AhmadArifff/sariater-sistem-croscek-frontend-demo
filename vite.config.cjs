import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "React PWA App",
        short_name: "ReactPWA",
        description: "A Progressive Web App built with React & Vite",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // Optimize bundle size
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split React and React DOM
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
            return "react-vendor";
          }
          // Split chart library (largest UI dependency)
          if (id.includes("node_modules/recharts")) {
            return "charts";
          }
          // Split Excel-related libraries
          if (id.includes("node_modules/xlsx") || id.includes("node_modules/exceljs")) {
            return "excel-libs";
          }
          // Split routing
          if (id.includes("node_modules/react-router-dom")) {
            return "router";
          }
          // Split other utilities
          if (id.includes("node_modules/axios") || id.includes("node_modules/file-saver")) {
            return "utils";
          }
          // Split icons
          if (id.includes("node_modules/lucide-react")) {
            return "icons";
          }
        },
      },
    },
    // Reduce initial bundle
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    target: "esnext",
    cssCodeSplit: true,
  },
});
