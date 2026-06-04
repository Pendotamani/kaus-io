// TanStack Start build config.
//
// Default target is Lovable's Cloudflare Workers host so the published
// `*.lovable.app` site keeps building (Lovable's CI expects a `dist/`
// directory from the cloudflare preset).
//
// To build for Vercel, set NITRO_PRESET=vercel at build time:
//   NITRO_PRESET=vercel bun run build
// That emits Vercel Build Output API v3 artifacts under `.vercel/output/`.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const preset = process.env.NITRO_PRESET ?? "cloudflare-module";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro:
    preset === "vercel"
      ? {
          preset: "vercel",
          output: {
            dir: ".vercel/output",
            serverDir: ".vercel/output/functions/__server.func",
            publicDir: ".vercel/output/static",
          },
        }
      : { preset },
});
