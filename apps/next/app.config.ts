import { fileURLToPath } from "url";
import { defineConfig } from "@tanstack/start/config";
import { input } from "vinxi/plugins/config";
import tsconfigPaths from "vite-tsconfig-paths";

//import middleware from "./app/middleware";

/** @returns {import('vinxi').RouterSchemaInput} */
function trpcRouter() {
  return {
    name: "trpc",
    base: "/trpc",
    type: "http",
    handler: "./handler.ts",
    target: "server",
  };
}

function authRouter({ plugins = () => [] } = {}) {
  return {
    name: "auth",
    base: "/auth",
    type: "http",
    handler: "./auth.ts",
    target: "server",
  };
}

const base = defineConfig({
  vite: {
    plugins: () => [tsconfigPaths()],
  },
});

base.addRouter(trpcRouter());

base.config.routers.forEach((v) => {
  if ("middleware" in v) {
    v.middleware = "./app/middleware.ts";
  }
});

base.addRouter(authRouter());

export default base;
