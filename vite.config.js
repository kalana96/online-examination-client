import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  define: {
    "process.env": process.env,
    global: "globalThis", // Add this line to fix the sockjs-client error
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@tailwindConfig": path.resolve(__dirname, "tailwind.config.js"),
    },
  },
  optimizeDeps: {
    include: [
      "@tailwindConfig",
      "sockjs-client", // Add sockjs-client for better optimization
      "@stomp/stompjs", // Add STOMP client as well
    ],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
