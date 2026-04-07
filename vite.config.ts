import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
  },
  build: {
    outDir: "build/webview",
    emptyOutDir: true,
    rollupOptions: {
      input: "src/index.tsx",
      output: {
        entryFileNames: "index.js",
        assetFileNames: "index[extname]",
        inlineDynamicImports: true,
      },
    },
  },
});
