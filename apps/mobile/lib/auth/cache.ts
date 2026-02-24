import { CachedAuthRecord, CachedAuthRecordSchema } from "@/lib/auth/schemas";

export type AuthStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

export const createAuthCacheKey = ({
  serverURL,
  storagePrefix,
}: {
  serverURL: string;
  storagePrefix: string;
}) => {
  return `${storagePrefix}-session-${normalizeForKey(serverURL)}`;
};

export const readAuthCache = async ({
  storage,
  key,
}: {
  storage: AuthStorage;
  key: string;
}): Promise<CachedAuthRecord | null> => {
  const raw = await storage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return CachedAuthRecordSchema.parse(parsed);
  } catch {
    return null;
  }
};

export const writeAuthCache = async ({
  storage,
  key,
  record,
}: {
  storage: AuthStorage;
  key: string;
  record: CachedAuthRecord;
}) => {
  await storage.setItem(key, JSON.stringify(record));
};

export const clearAuthCache = async ({
  storage,
  key,
}: {
  storage: AuthStorage;
  key: string;
}) => {
  await storage.removeItem(key);
};

const normalizeForKey = (value: string) => value.replace(/[^a-z0-9]/gi, "_").toLowerCase();
