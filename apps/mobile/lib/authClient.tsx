import * as SecureStore from "expo-secure-store";
import { expoClient } from "@better-auth/expo/client";
import { jwtClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { useServerURL } from "@/lib/ServerURLContext";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";

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
    console.log("create auth client with serverURL", serverURL);
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

export const sessionCachedProvider = createContext<{
  sessionInStore: AuthData | null;
  invalidate: () => Promise<void>;
}>({
  sessionInStore: null,
  invalidate: async () => {},
});

export const SessionCachedProvider = ({ children }: { children: ReactNode }) => {
  const [sessionInStore, setSessionInStore] = useState<AuthData | null>(null);
  const { serverURL } = useServerURL();

  const refreshSession = useCallback(async (serverURL: string | null) => {
    if (!serverURL) {
      setSessionInStore(null);
      return;
    }
    const s = await getSessionFromStore(serverURL);
    setSessionInStore(s);
  }, []);

  const invalidate = useCallback(async () => {
    refreshSession(serverURL);
  }, [serverURL]);

  useLayoutEffect(() => {
    void refreshSession(serverURL);
  }, [refreshSession, serverURL]);

  return (
    <sessionCachedProvider.Provider value={{ sessionInStore, invalidate }}>
      {children}
    </sessionCachedProvider.Provider>
  );
};

// TODO: warning when no real session. If session in store is expired ask for relogin.
export const useSessionCached = () => {
  const { serverURL } = useServerURL();

  const { authClient } = useAuthClient();
  const session = authClient.useSession();

  const sessionInStore = useContext(sessionCachedProvider);

  const qc = useQueryClient();

  const signOut = useCallback(async () => {
    await authClient.signOut();
    await removeSessionFromStore(serverURL);
    await sessionInStore.invalidate();
  }, [serverURL, authClient, qc]);

  const updateStores = useCallback(
    async (session: ReturnType<AuthClient["useSession"]>) => {
      if (session.data) {
        await writeSessionToStore(serverURL, session.data);
        await sessionInStore.invalidate();
      }
    },
    [serverURL],
  );

  useEffect(() => {
    updateStores(session);
  }, [updateStores, session]);

  const hasReadySession = session.data?.user && !session.isPending;

  const s: AuthData | null = hasReadySession ? session.data : sessionInStore.sessionInStore;

  const isExpired = s && s.session.expiresAt < new Date();
  const isNotReal = !hasReadySession;

  return { realSession: session, data: s, isExpired, isNotReal, signOut };
};
