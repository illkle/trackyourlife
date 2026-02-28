import * as SecureStore from "expo-secure-store";
import { expoClient } from "@better-auth/expo/client";
import { jwtClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { useServerURL } from "@/lib/ServerURLContext";
import { isBefore } from "date-fns";
import { AuthData, AuthDataSchema } from "@/lib/auth/schemas";
import {
  createOfflineAuthModule,
  OfflineAuthModule,
  OfflineAuthSnapshot,
} from "@/lib/auth/offlineAuthModule";

const STORAGE_PREFIX = "tyl";

const createBetterAuth = (serverURL: string) => {
  return createAuthClient({
    baseURL: serverURL,
    plugins: [
      expoClient({
        scheme: "tyl",
        storagePrefix: STORAGE_PREFIX,
        storage: SecureStore,
      }),
      jwtClient(),
    ],
    sessionOptions: {
      refetchWhenOffline: true,
    },
    trustedOrigins: [
      "tyl://",
      ...(process.env.NODE_ENV === "development"
        ? [
            "exp://*/*",
            "exp://10.0.0.*:*/*",
            "exp://192.168.*.*:*/*",
            "exp://172.*.*.*:*/*",
            "exp://localhost:*/*",
            "http://localhost:*/*",
            "http://localhost:3000/*",
            "http://localhost:3000",
          ]
        : []),
    ],
  });
};

export type AuthClient = ReturnType<typeof createBetterAuth>;

const EMPTY_SNAPSHOT: OfflineAuthSnapshot = {
  data: null,
  source: "none",
  isExpired: false,
  isOfflineFallback: false,
  isPending: false,
  lastSyncAt: null,
  error: null,
};

const AuthClientContext = createContext<{
  authClient: AuthClient;
  serverURL: string | null;
  offlineAuth: OfflineAuthModule | null;
}>({
  authClient: createBetterAuth(""),
  serverURL: null,
  offlineAuth: null,
});

export const useAuthClient = () => {
  return useContext(AuthClientContext);
};

const toStorageAdapter = () => ({
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
});

export const AuthClientProvider = ({ children }: { children: ReactNode }) => {
  const { serverURL } = useServerURL();

  const authClient = useMemo(() => {
    return createBetterAuth(serverURL ?? "");
  }, [serverURL]);

  const offlineAuth = useMemo(() => {
    if (!serverURL) return null;
    return createOfflineAuthModule({
      authClient,
      storage: toStorageAdapter(),
      serverURL,
      storagePrefix: STORAGE_PREFIX,
    });
  }, [authClient, serverURL]);

  useEffect(() => {
    if (!offlineAuth) return;
    void offlineAuth.bootstrap().then(() => offlineAuth.refreshFromServer());
  }, [offlineAuth]);

  return (
    <AuthClientContext.Provider value={{ authClient, serverURL, offlineAuth }}>
      {children}
    </AuthClientContext.Provider>
  );
};

export const SessionCachedProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export const useSessionCached = () => {
  const { authClient, offlineAuth } = useAuthClient();
  const realSession = authClient.useSession();

  const offlineSnapshot = useSyncExternalStore(
    offlineAuth?.subscribe ?? (() => () => {}),
    offlineAuth?.getSnapshot ?? (() => EMPTY_SNAPSHOT),
    () => EMPTY_SNAPSHOT,
  );

  const parsedRealSession = useMemo(() => {
    if (!realSession.data) return null;
    const parsed = AuthDataSchema.safeParse(realSession.data);
    return parsed.success ? parsed.data : null;
  }, [realSession.data]);

  useEffect(() => {
    if (!offlineAuth || !parsedRealSession) return;
    void offlineAuth.ingestServerSession(parsedRealSession);
  }, [offlineAuth, parsedRealSession]);

  const hasReadySession = Boolean(parsedRealSession) && !realSession.isPending;
  const data: AuthData | null = hasReadySession ? parsedRealSession : offlineSnapshot.data;
  const isExpired = data ? isBefore(data.session.expiresAt, new Date()) : false;
  const isNotReal = !hasReadySession;

  return {
    realSession,
    data,
    isExpired,
    isNotReal,
    isOfflineFallback: offlineSnapshot.isOfflineFallback,
    source: hasReadySession ? "server" : offlineSnapshot.source,
    error: realSession.error?.message ?? offlineSnapshot.error,
    signOut: async () => {
      if (offlineAuth) {
        await offlineAuth.signOut();
        return;
      }
      try {
        await authClient.signOut();
      } catch {
        return;
      }
    },
  };
};
