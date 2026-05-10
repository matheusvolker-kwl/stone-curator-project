import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
const SUPABASE_URL_FALLBACK = "https://zibtysewpbeycngtbjjk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY_FALLBACK =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYnR5c2V3cGJleWNuZ3RiamprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDE3NjMsImV4cCI6MjA5MzkxNzc2M30.NGI4k2HuA2DlNlIXS5twA5ZxB3mEn4vbHgyHH1e6ytA";
const SUPABASE_PROJECT_ID_FALLBACK = "zibtysewpbeycngtbjjk";

export default defineConfig(({ mode }) => ({
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
      process.env.VITE_SUPABASE_URL || SUPABASE_URL_FALLBACK,
    ),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY_FALLBACK,
    ),
    "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(
      process.env.VITE_SUPABASE_PROJECT_ID || SUPABASE_PROJECT_ID_FALLBACK,
    ),
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-router")) return "router";
          if (id.includes("@tanstack/react-query") || id.includes("@tanstack/query-core")) return "query";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("zod") || id.includes("react-hook-form")) return "forms";
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          if (id.includes("date-fns")) return "date";
          if (id.includes("react-dom") || id.includes("react/")) return "react";
        },
      },
    },
  },
}));
