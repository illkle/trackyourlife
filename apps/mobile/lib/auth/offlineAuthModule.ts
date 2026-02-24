import { isBefore } from "date-fns";
import {
  AuthStorage,
  clearAuthCache,
  createAuthCacheKey,
  readAuthCache,
  writeAuthCache,
} from "@/lib/auth/cache";
import {
  getErrorMessage,
  isAuthFailureError,
  isLikelyRecoverableSessionError,
} from "@/lib/auth/errors";
import { AuthData, AuthDataSchema } from "@/lib/auth/schemas";

type BetterAuthLikeClient = {
  getSession: () => Promise<{ data: unknown | null; error: unknown | null }>;
  signOut: () => Promise<unknown>;
};

export type OfflineAuthSource = "server" | "cache" | "none";

export type OfflineAuthSnapshot = {
  data: AuthData | null;
  source: OfflineAuthSource;
  isExpired: boolean;
  isOfflineFallback: boolean;
  isPending: boolean;
  lastSyncAt: Date | null;
  error: string | null;
};

export type OfflineAuthResult = {
  data: AuthData | null;
  source: OfflineAuthSource;
  isExpired: boolean;
  isOfflineFallback: boolean;
  error: string | null;
};

export type OfflineAuthModule = {
  bootstrap: () => Promise<void>;
  getSnapshot: () => OfflineAuthSnapshot;
  subscribe: (listener: () => void) => () => void;
  ingestServerSession: (data: AuthData) => Promise<void>;
  getSession: (options?: { preferCache?: boolean }) => Promise<OfflineAuthResult>;
  refreshFromServer: () => Promise<OfflineAuthResult>;
  signOut: () => Promise<{ remoteSucceeded: boolean }>;
  clearLocal: () => Promise<void>;
};

export const createOfflineAuthModule = ({
  authClient,
  storage,
  serverURL,
  storagePrefix,
  now = () => new Date(),
}: {
  authClient: BetterAuthLikeClient;
  storage: AuthStorage;
  serverURL: string;
  storagePrefix: string;
  now?: () => Date;
}): OfflineAuthModule => {
  let snapshot: OfflineAuthSnapshot = {
    data: null,
    source: "none",
    isExpired: false,
    isOfflineFallback: false,
    isPending: false,
    lastSyncAt: null,
    error: null,
  };

  const listeners = new Set<() => void>();
  const cacheKey = createAuthCacheKey({ serverURL, storagePrefix });

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  const setSnapshot = (next: OfflineAuthSnapshot) => {
    snapshot = next;
    notify();
  };

  const toResult = (): OfflineAuthResult => ({
    data: snapshot.data,
    source: snapshot.source,
    isExpired: snapshot.isExpired,
    isOfflineFallback: snapshot.isOfflineFallback,
    error: snapshot.error,
  });

  const computeIsExpired = (data: AuthData | null) => {
    if (!data) return false;
    return isBefore(data.session.expiresAt, now());
  };

  const readCacheData = async () => {
    const cached = await readAuthCache({ storage, key: cacheKey });
    return cached?.data ?? null;
  };

  const setCacheState = async ({
    data,
    error,
  }: {
    data: AuthData;
    error?: string | null;
  }) => {
    setSnapshot({
      data,
      source: "cache",
      isExpired: computeIsExpired(data),
      isOfflineFallback: true,
      isPending: false,
      lastSyncAt: snapshot.lastSyncAt,
      error: error ?? null,
    });
  };

  const setServerState = async (data: AuthData) => {
    await writeAuthCache({
      storage,
      key: cacheKey,
      record: {
        data,
        cachedAt: now(),
      },
    });

    setSnapshot({
      data,
      source: "server",
      isExpired: computeIsExpired(data),
      isOfflineFallback: false,
      isPending: false,
      lastSyncAt: now(),
      error: null,
    });
  };

  const clearLocal = async () => {
    await clearAuthCache({ storage, key: cacheKey });
    setSnapshot({
      data: null,
      source: "none",
      isExpired: false,
      isOfflineFallback: false,
      isPending: false,
      lastSyncAt: snapshot.lastSyncAt,
      error: null,
    });
  };

  const bootstrap = async () => {
    const cachedData = await readCacheData();
    if (!cachedData) {
      setSnapshot({
        ...snapshot,
        data: null,
        source: "none",
        isExpired: false,
        isOfflineFallback: false,
        isPending: false,
      });
      return;
    }

    await setCacheState({ data: cachedData });
  };

  const refreshFromServer = async (): Promise<OfflineAuthResult> => {
    setSnapshot({
      ...snapshot,
      isPending: true,
      error: null,
    });

    const { data, error } = await authClient.getSession();

    if (data) {
      const parsed = AuthDataSchema.safeParse(data);
      if (parsed.success) {
        await setServerState(parsed.data);
        return toResult();
      }
    }

    if (error && isAuthFailureError(error)) {
      await clearLocal();
      setSnapshot({
        ...snapshot,
        error: getErrorMessage(error),
      });
      return toResult();
    }

    if (error && isLikelyRecoverableSessionError(error)) {
      const cachedData = await readCacheData();
      if (cachedData) {
        await setCacheState({ data: cachedData, error: getErrorMessage(error) });
        return toResult();
      }
    }

    if (error) {
      setSnapshot({
        ...snapshot,
        data: null,
        source: "none",
        isExpired: false,
        isOfflineFallback: false,
        isPending: false,
        error: getErrorMessage(error),
      });
      return toResult();
    }

    await clearLocal();
    return toResult();
  };

  return {
    bootstrap,
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    ingestServerSession: setServerState,
    getSession: async ({ preferCache = false } = {}) => {
      if (preferCache && snapshot.data) {
        return toResult();
      }
      return refreshFromServer();
    },
    refreshFromServer,
    signOut: async () => {
      await clearLocal();
      try {
        await authClient.signOut();
        return { remoteSucceeded: true };
      } catch {
        return { remoteSucceeded: false };
      }
    },
    clearLocal,
  };
};
