import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    host: true,
    port: 5173,
  },

  preview: {
    host: true,
    port: 4173,
  },

  build: {
    target: "esnext",
    sourcemap: false,
    cssCodeSplit: true,
    minify: "esbuild",
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        manualChunks(id) {
          /* node_modules split */
          if (id.includes("node_modules")) {
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom")
            ) {
              return "react-vendor";
            }

            if (
              id.includes("@reduxjs") ||
              id.includes("react-redux")
            ) {
              return "redux-vendor";
            }

            if (
              id.includes("@tanstack/react-query")
            ) {
              return "query-vendor";
            }

            if (
              id.includes("recharts")
            ) {
              return "charts-vendor";
            }

            if (
              id.includes("framer-motion")
            ) {
              return "motion-vendor";
            }

            if (
              id.includes("firebase")
            ) {
              return "firebase-vendor";
            }

            if (
              id.includes("@monaco-editor") ||
              id.includes("monaco-editor")
            ) {
              return "editor-vendor";
            }

            if (
              id.includes("jspdf") ||
              id.includes("html2canvas")
            ) {
              return "pdf-vendor";
            }

            return "vendor";
          }
        },

        chunkFileNames:
          "assets/js/[name]-[hash].js",

        entryFileNames:
          "assets/js/[name]-[hash].js",

        assetFileNames:
          "assets/[ext]/[name]-[hash].[ext]",
      },
    },
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@reduxjs/toolkit",
      "react-redux",
    ],
  },
});