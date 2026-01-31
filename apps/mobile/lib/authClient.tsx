import * as SecureStore from "expo-secure-store";
import { expoClient } from "@better-auth/expo/client";
import { jwtClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useServerURL } from "@/lib/ServerURLContext";
import { z } from "zod";

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

export const UserSchema = z.object({
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  email: z.string(),
  emailVerified: z.boolean(),
  name: z.string(),
  image: z.string().nullable().optional(),
});

export const SessionSchema = z.object({
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  userId: z.string(),
  expiresAt: z.coerce.date(),
  token: z.string(),
  ipAddress: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
});

export const AuthDataSchema = z.object({
  user: UserSchema,
  session: SessionSchema,
});

export type AuthData = z.infer<typeof AuthDataSchema>;

const getSessionStoreKey = (serverURL: string | null) => {
  if (!serverURL) return null;
  return `session-${keepAlphanumeric(serverURL)}`;
};

const getSessionFromStore = (serverURL: string | null) => {
  const key = getSessionStoreKey(serverURL);
  if (!key) return null;

  const item = SecureStore.getItem(key);

  if (!item) return null;

  try {
    const p = JSON.parse(item);
    return AuthDataSchema.parse(p);
  } catch {
    return null;
  }
};

const writeSessionToStore = (
  serverURL: string | null,
  session: ReturnType<AuthClient["useSession"]>["data"] | null,
) => {
  const key = getSessionStoreKey(serverURL);
  if (!key) return;
  SecureStore.setItem(key, JSON.stringify(session));
};

export const removeSessionFromStore = async (serverURL: string | null) => {
  const key = getSessionStoreKey(serverURL);
  if (!key) return;
  await SecureStore.deleteItemAsync(key);
};

function keepAlphanumeric(str: string) {
  return str.replace(/[^a-z0-9]/gi, "");
}

export const useSessionCached = () => {
  const { serverURL } = useServerURL();

  const { authClient } = useAuthClient();
  const session = authClient.useSession();

  const [sessionInStore, setSessionInStore] = useState<
    ReturnType<AuthClient["useSession"]>["data"] | null
  >(getSessionFromStore(serverURL));

  useEffect(() => {
    setSessionInStore(getSessionFromStore(serverURL));
  }, [serverURL]);

  useEffect(() => {
    if (session.data) {
      writeSessionToStore(serverURL, session.data);
      setSessionInStore(session.data);
    }
  }, [session.data, serverURL]);

  const hasReadySession = session.data?.user && !session.isPending;

  return { ...session, data: hasReadySession ? session.data : sessionInStore };
};
