import { fileURLToPath } from "node:url";
import solid from "@solidjs/vite-plugin";
import { defineConfig } from "vitest/config";

const clientSolid = fileURLToPath(new URL("./node_modules/solid-js/dist/solid.js", import.meta.url));
const clientWeb = fileURLToPath(new URL("./node_modules/@solidjs/web/dist/web.js", import.meta.url));
const hullOrigin = process.env.HULL_ORIGIN ?? "http://127.0.0.1:4471";
const apiProxy = { "/api": { target: hullOrigin, changeOrigin: true } };

export default defineConfig(({ mode }) => ({
  plugins: [
    solid({
      include: ["src/**/*.{ts,tsx}", "tests/**/*.tsx"],
      dev: mode === "test" ? false : undefined,
    }),
  ],
  server: { host: process.env.HOST ?? "127.0.0.1", port: 4483, proxy: apiProxy },
  preview: { host: process.env.HOST ?? "127.0.0.1", port: 4483, proxy: apiProxy },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    alias: [
      { find: /^solid-js$/, replacement: clientSolid },
      { find: /^@solidjs\/web$/, replacement: clientWeb },
    ],
  },
}));
