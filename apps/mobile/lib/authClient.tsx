import * as SecureStore from "expo-secure-store";
import { expoClient } from "@better-auth/expo/client";
import { jwtClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { createContext, ReactNode, useContext, useMemo } from "react";
import { useServerURL } from "@/lib/ServerURLContext";

const createBetterAuth = (serverURL: string) => {
  return createAuthClient({
    baseURL: serverURL, // Base URL of your Better Auth backend.
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
            "http://localhost:3000/*", // Trust localhost:3000
            "http://localhost:3000", // Trust localhost
          ]
        : []),
    ],
  });
};

export type AuthClient = ReturnType<typeof createBetterAuth>;

const AuthClientContext = createContext<{
  authClient: AuthClient;
  serverURL: string | null;
}>({
  authClient: createBetterAuth(""),
  serverURL: null,
});

export const useAuthClient = () => {
  const context = useContext(AuthClientContext);
  return context;
};

export const AuthClientProvider = ({ children }: { children: ReactNode }) => {
  const { serverURL } = useServerURL();

  const authClient = useMemo(() => {
    return createBetterAuth(serverURL ?? "");
  }, [serverURL]);

  return (
    <AuthClientContext.Provider value={{ authClient, serverURL }}>
      {children}
    </AuthClientContext.Provider>
  );
};
