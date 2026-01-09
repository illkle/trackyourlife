import * as SecureStore from "expo-secure-store";
import { expoClient } from "@better-auth/expo/client";
import { jwtClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "https://tyl-dev.illkle.com/", // Base URL of your Better Auth backend.
  plugins: [
    expoClient({
      scheme: "tyl",
      storagePrefix: "tyl",
      storage: SecureStore,
    }),
    jwtClient(),
  ],
  trustedOrigins: [
    "tyl://",
    // Development mode - Expo's exp:// scheme with local IP ranges
    ...(process.env.NODE_ENV === "development"
      ? [
          "exp://*/*", // Trust all Expo development URLs
          "exp://10.0.0.*:*/*", // Trust 10.0.0.x IP range
          "exp://192.168.*.*:*/*", // Trust 192.168.x.x IP range
          "exp://172.*.*.*:*/*", // Trust 172.x.x.x IP range
          "exp://localhost:*/*", // Trust localhost
          "http://localhost:*/*", // Trust localhost
        ]
      : []),
  ],
});
