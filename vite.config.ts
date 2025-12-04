import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import zaloMiniApp from "zmp-vite-plugin";

export default defineConfig({
  root: "./src",
  base: "",
  plugins: [react(), zaloMiniApp()],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: "../www",
    emptyOutDir: true,
    target: "es2015",
    cssTarget: ["es2015", "safari13.1"],
  },
});
