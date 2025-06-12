import { jwtClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL, // the base url of your auth server
  plugins: [jwtClient()],
});
export type Session = typeof authClient.$Infer.Session;
