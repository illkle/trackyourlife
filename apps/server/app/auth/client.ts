import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL, // the base url of your auth server
});
export type Session = typeof authClient.$Infer.Session;
