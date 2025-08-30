import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "@tanstack/start/config";
import tsConfigPaths from "vite-tsconfig-paths";

const confg = defineConfig({
  server: {
    preset: "node-server",
    watchOptions: {
      ignored: ["**/node_modules/@tyl*/**"],
    },
    esbuild: {
      options: {
        target: "es2022",
      },
    },
  },

  vite: {
    server: {
      host: true,
      port: 80,
    },
    optimizeDeps: {
      esbuildOptions: {
        target: "es2022",
        supported: {
          "top-level-await": true,
        },
      },
    },

    build: {
      target: "es2022",
    },
    esbuild: {
      target: "es2022",
      supported: {
        "top-level-await": true,
      },
    },

    plugins: [tsConfigPaths({ projects: ["./tsconfig.json"] })],
  },
});

export default confg;
