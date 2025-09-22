import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    host: true,
    port: 80,
  },
  plugins: [
    tsconfigPaths({ projects: ["./tsconfig.json"] }),

    tailwindcss(),
    tanstackStart({ customViteReactPlugin: true }),
    viteReact(),
  ],
});
