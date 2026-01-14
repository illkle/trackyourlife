import { jwtClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_DEPLOY_DOMAIN, // the base url of your auth server
  plugins: [jwtClient()],
});
export type Session = typeof authClient.$Infer.Session;
