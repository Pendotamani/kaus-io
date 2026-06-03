// Vercel-targeted TanStack Start SSR build.
//
// The Lovable wrapper is retained because it bundles the TanStack Start
// plugin, React plugin, Tailwind plugin, tsconfig paths, env injection,
// and the nitro deploy plugin. We override the nitro preset to Vercel
// so the build emits `.vercel/output/` which Vercel auto-detects.
//
// NITRO_PRESET can be overridden at build-time (e.g. NITRO_PRESET=node-server
// bun run build) without editing this file.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: process.env.NITRO_PRESET ?? "vercel",
  },
});
