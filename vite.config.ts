import vinext from "vinext";
import { defineConfig } from "vite";

const usePolling = process.env.CHORUS_USE_POLLING === "1";

export default defineConfig(async () => {
  // Keep development-runtime files inside the checkout. Player state remains
  // in the browser unless the player deliberately chooses a save operation.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler reads its log path while the Cloudflare plugin is imported.
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
        viteEnvironment: {
          name: "rsc",
          childEnvironments: ["ssr"],
        },
        inspectorPort: false,
        config: {
          name: "chorus",
          main: "./worker/index.ts",
          compatibility_date: "2026-08-15",
          compatibility_flags: ["nodejs_compat"],

          // Publish only at the canonical domain. Preview URLs can be enabled
          // later as a separate, explicitly protected deployment policy.
          workers_dev: false,
          preview_urls: false,
          routes: [
            {
              pattern: "chorus.observer",
              custom_domain: true,
            },
          ],

          // CHORUS contains no application telemetry. Keep Worker log and
          // trace persistence off as part of the deployment configuration.
          logpush: false,
          observability: {
            enabled: false,
            logs: {
              enabled: false,
              invocation_logs: false,
              persist: false,
            },
            traces: {
              enabled: false,
              persist: false,
            },
          },

          d1_databases: [],
          r2_buckets: [],
        },
      }),
    ],
  };
});
