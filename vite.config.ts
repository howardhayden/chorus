import vinext from "vinext";
import { defineConfig } from "vite";

// Polling is opt-in for filesystems that cannot deliver native watcher events.
const usePolling = process.env.CHORUS_USE_POLLING === "1";

export default defineConfig(async () => {
  // Keep local runtime state inside the checkout. Application data remains in
  // the browser unless the player deliberately selects a local save model.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: {
      host: "0.0.0.0",
      ...(usePolling
        ? { watch: { useFsEvents: false, usePolling: true } }
        : {}),
    },
    plugins: [
      vinext(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        config: {
          main: "./worker/index.ts",
          compatibility_flags: ["nodejs_compat"],
          d1_databases: [],
          r2_buckets: [],
        },
      }),
    ],
  };
});
