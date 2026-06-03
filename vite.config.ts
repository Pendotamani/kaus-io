// Vercel-targeted TanStack Start SSR build.
//
// The Lovable wrapper provides the TanStack Start, React, Tailwind, and
// nitro deploy plugins. We override the nitro preset to `vercel` and
// restore the preset's standard output layout (`.vercel/output/...`) so
// Vercel auto-detects the Build Output API artifacts.
//
// NITRO_PRESET can be overridden at build time, e.g.
//   NITRO_PRESET=node-server bun run build
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: process.env.NITRO_PRESET ?? "vercel",
    output: {
      dir: ".vercel/output",
      serverDir: ".vercel/output/functions/__server.func",
      publicDir: ".vercel/output/static",
    },
  },
});
