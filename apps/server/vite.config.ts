// vite.config.ts
//import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  /*
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
  */

  plugins: [
    tsconfigPaths({ projects: ["./tsconfig.json"] }),

    //  tailwindcss(),
    tanstackStart({
      /** Add your options here */
    }),
  ],
});
