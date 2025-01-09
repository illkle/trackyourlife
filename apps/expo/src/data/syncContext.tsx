import { hookstate } from "@hookstate/core";
import { and, eq, gte, lte, sql } from "drizzle-orm";

import type { ITrackableWithoutData } from "@tyl/validators/trackable";
import type { IUserSettings } from "@tyl/validators/user";
import { debounce } from "@tyl/helpers";

import type { LDbTrackableRecordInsert } from "~/db/schema";
import { currentUser } from "~/data/authContext";
import { db } from "~/db";
import { authUser, meta, trackable, trackableRecord } from "~/db/schema";
import { api } from "~/utils/api";

const lastSync = hookstate<Date | null>(null);
const isSyncing = hookstate(false);
const isSyncEnabled = hookstate(false);
const syncError = hookstate("");

const updateLastSyncFromDb = () => {
  const userId = currentUser.get()?.userId;

  if (!userId) {
    lastSync.set(null);
    isSyncEnabled.set(false);
    return;
  }

  void db.query.meta.findFirst({ where: eq(meta.userId, userId) }).then((v) => {
    if (v?.lastSync) {
      lastSync.set(v.lastSync);
    }

    isSyncEnabled.set(true);
  });
};

updateLastSyncFromDb();

currentUser.subscribe(() => {
  updateLastSyncFromDb();
});

const getChangesFromDb = async (ls: Date, userId: string) => {
  const recordUpdates = await db.query.trackableRecord.findMany({
    where: and(
      eq(trackableRecord.userId, userId),
      gte(trackableRecord.updated, ls),
    ),
  });

  const trackableUpdates = await db.query.trackable.findMany({
    where: and(eq(trackable.userId, userId), gte(trackable.updated, ls)),
  });

  const userUpdates = await db.query.authUser.findFirst({
    where: and(eq(authUser.id, userId), gte(authUser.updated, ls)),
  });

  return { recordUpdates, trackableUpdates, userUpdates };
};

const applyChangesToDb = async (
  userId: string,
  nowDate: Date,
  u: Awaited<ReturnType<typeof api.syncRouter.syncv2.query>>,
  overwrite?: boolean,
) => {
  const { trackables, records, user } = u;

  if (trackables.length) {
    await db
      .insert(trackable)
      .values(trackables)
      .onConflictDoUpdate({
        target: [trackable.id],
        set: {
          type: sql.raw(`excluded.${trackable.type.name}`),
          settings: sql.raw(`excluded.${trackable.settings.name}`),
          updated: sql.raw(`excluded.${trackable.updated.name}`),
          name: sql.raw(`excluded.${trackable.name.name}`),
          userId: sql.raw(`excluded.${trackable.userId.name}`),
          isDeleted: sql.raw(`excluded.${trackable.isDeleted.name}`),
        },
        setWhere: overwrite
          ? undefined
          : lte(
              trackable.updated,
              sql.raw(`excluded.${trackable.updated.name}`),
            ),
      });
  }

  if (records.length) {
    await db
      .insert(trackableRecord)
      .values(records)
      .onConflictDoUpdate({
        target: [trackableRecord.trackableId, trackableRecord.date],
        set: {
          value: sql.raw(`excluded.${trackableRecord.value.name}`),
          updated: sql.raw(`excluded.${trackableRecord.updated.name}`),
        },
        setWhere: overwrite
          ? undefined
          : lte(
              trackableRecord.updated,
              sql.raw(`excluded.${trackableRecord.updated.name}`),
            ),
      });
  }

  if (user) {
    await db
      .insert(authUser)
      .values(user)
      .onConflictDoUpdate({
        target: [authUser.id],
        set: {
          username: sql.raw(`excluded.${authUser.username.name}`),
          updated: sql.raw(`excluded.${authUser.updated.name}`),
          settings: sql.raw(`excluded.${authUser.settings.name}`),
          email: sql.raw(`excluded.${authUser.email.name}`),
        },
        setWhere: overwrite
          ? eq(authUser.id, userId)
          : and(eq(authUser.id, userId), lte(authUser.updated, user.updated)),
      });
  }

  await db
    .insert(meta)
    .values({ userId, lastSync: nowDate })
    .onConflictDoUpdate({
      target: meta.userId,
      set: {
        lastSync: nowDate,
      },
    });
};

const sync = async (clear?: boolean) => {
  if (!isSyncEnabled.get()) return;
  if (isSyncing.get()) return;

  const userId = currentUser.get()?.userId;
  if (!userId) return;

  isSyncing.set(true);
  syncError.set("");

  let ls = lastSync.get() ?? new Date(1971);

  try {
    const nowDate = new Date();
    if (clear) {
      ls = new Date(1970);
    }

    const localUpdates = await getChangesFromDb(ls, userId);

    console.log("\n\n");
    console.log("SYNC UP");
    console.log(
      "recordUpdates",
      localUpdates.recordUpdates.length,
      localUpdates.recordUpdates.map((v) => v.updated.toDateString()),
    );
    console.log("trackableUpdates", localUpdates.trackableUpdates.length);
    console.log("userUpdates", localUpdates.userUpdates);

    const syncRes = await api.syncRouter.syncv2.query({
      lastSync: ls,
      trackableUpdates:
        localUpdates.trackableUpdates as ITrackableWithoutData[],
      recordUpdates: localUpdates.recordUpdates,
      userUpdates: localUpdates.userUpdates
        ? {
            username: localUpdates.userUpdates.username ?? "",
            settings: localUpdates.userUpdates.settings ?? {},
            updated: localUpdates.userUpdates.updated,
          }
        : undefined,
    });

    console.log("SYNC RES");
    console.log("trackables", syncRes.trackables.length);
    console.log("records", syncRes.records.length);
    console.log("user", syncRes.user);

    await applyChangesToDb(userId, nowDate, syncRes);

    lastSync.set(nowDate);
  } catch (e) {
    console.log("ERR", e);
    syncError.set(String(e));
  } finally {
    isSyncing.set(false);
  }
};
const debouncedSync = debounce(sync, 500);

const updateTrackableRecord = async (v: LDbTrackableRecordInsert) => {
  await db
    .insert(trackableRecord)
    .values(v)
    .onConflictDoUpdate({
      target: [trackableRecord.trackableId, trackableRecord.date],
      set: {
        updated: new Date(),
        value: sql.raw(`excluded.${trackableRecord.value.name}`),
      },
    });
  //  debouncedSync();
};

const useSyncInterval = () => {
  return;
  /*
  useEffect(() => {
    const fsync = () => {
      const ls = lastSync.get();
      if (!ls) {
        sync();
        return;
      }

      const date = new Date();
      const secondsSinceLast = (date.getTime() - ls.getTime()) / 1000;

      const diffToSync = AppState.currentState === "active" ? 15 : 60 * 10;

      if (secondsSinceLast > diffToSync) {
        debouncedSync();
      }
    };

    fsync();

    const i = setInterval(fsync, 5000);

    return () => clearInterval(i);
  });
  */
};

export {
  updateTrackableRecord,
  debouncedSync,
  sync,
  updateLastSyncFromDb,
  isSyncing,
  isSyncEnabled,
  lastSync,
  syncError,
  useSyncInterval,
};
