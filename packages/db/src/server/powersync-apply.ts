import { CrudBatch, UpdateType } from "@powersync/common";
import { and, eq, isNotNull } from "drizzle-orm";

import { db } from ".";
import {
  trackable,
  trackable_flags,
  trackable_flags_insert_schema,
  trackable_flags_update_schema,
  trackable_group,
  trackable_group_insert_schema,
  trackable_group_update_schema,
  trackable_insert_schema,
  trackable_record,
  trackable_record_insert_schema,
  trackable_record_update_schema,
  trackable_update_schema,
  user_flags,
  user_flags_insert_schema,
  user_flags_update_schema,
} from "./schema";

export type SyncEntry = {
  id: string;
  op: UpdateType;
  opData: CrudBatch["crud"][number]["opData"];
  table: string;
};

// ============================================================================
// TRACKABLE
// ============================================================================

export const applyCrudTrackable = async (entry: SyncEntry, user_id: string) => {
  const { id, opData } = entry;
  switch (entry.op) {
    case UpdateType.PUT: {
      const verified = trackable_insert_schema.parse({
        ...opData,
        id,
        user_id,
      });

      await db.insert(trackable).values({
        ...verified,
        id,
        user_id,
      });
      break;
    }
    case UpdateType.PATCH: {
      const verified = trackable_update_schema.parse(opData);

      await db
        .update(trackable)
        .set(verified)
        .where(and(eq(trackable.id, entry.id), eq(trackable.user_id, user_id)));
      break;
    }
    case UpdateType.DELETE: {
      await db
        .delete(trackable)
        .where(and(eq(trackable.id, entry.id), eq(trackable.user_id, user_id)));
      break;
    }
  }
};

// ============================================================================
// TRACKABLE FLAGS
// ============================================================================

const trackableFlagsFromClientId = (id: SyncEntry["id"]) => {
  const spl = id.split("|");

  if (spl.length != 3 || spl.some((s) => !s)) {
    throw new Error("Invalid trackable flag from client id: " + id);
  }

  return { trackable_id: spl[1]!, key: spl[2]! };
};

const trackable_flags_update_schema_only_value =
  trackable_flags_update_schema.pick({ value: true });

export const applyCrudTrackableFlags = async (
  entry: SyncEntry,
  user_id: string,
) => {
  const { opData } = entry;

  switch (entry.op) {
    case UpdateType.PUT: {
      const verified = trackable_flags_insert_schema.parse({
        ...opData,
        user_id,
      });

      await db
        .insert(trackable_flags)
        .values(verified)
        .onConflictDoUpdate({
          target: [
            trackable_flags.user_id,
            trackable_flags.trackable_id,
            trackable_flags.key,
          ],
          set: { value: verified.value },
        });
      break;
    }
    case UpdateType.PATCH: {
      const verified = trackable_flags_update_schema_only_value.parse(opData);

      const dataFromId = trackableFlagsFromClientId(entry.id);

      await db
        .update(trackable_flags)
        .set({ value: verified.value })
        .where(
          and(
            eq(trackable_flags.trackable_id, dataFromId.trackable_id),
            eq(trackable_flags.user_id, user_id),
            eq(trackable_flags.key, dataFromId.key),
          ),
        );
      break;
    }
    case UpdateType.DELETE: {
      const dataFromId = trackableFlagsFromClientId(entry.id);

      await db
        .delete(trackable_flags)
        .where(
          and(
            eq(trackable_flags.trackable_id, dataFromId.trackable_id),
            eq(trackable_flags.user_id, user_id),
            eq(trackable_flags.key, dataFromId.key),
          ),
        );
      break;
    }
  }
};

// ============================================================================
// TRACKABLE RECORD
// ============================================================================

export const applyCrudTrackableRecord = async (
  entry: SyncEntry,
  user_id: string,
) => {
  const opData = entry.opData as Record<string, unknown>;
  const id = entry.id;

  switch (entry.op) {
    case UpdateType.PUT: {
      const verified = trackable_record_insert_schema.parse({
        ...opData,
        id,
        user_id,
      });

      await db.insert(trackable_record).values(verified).onConflictDoUpdate({
        target: [trackable_record.trackable_id, trackable_record.time_bucket],
        targetWhere: isNotNull(trackable_record.time_bucket),
        set: { value: verified.value, updated_at: verified.updated_at },
      });
      break;
    }
    case UpdateType.PATCH: {
      const verified = trackable_record_update_schema.parse(opData);

      await db
        .update(trackable_record)
        .set(verified)
        .where(
          and(
            eq(trackable_record.id, id),
            eq(trackable_record.user_id, user_id),
          ),
        );
      break;
    }
    case UpdateType.DELETE: {
      await db
        .delete(trackable_record)
        .where(
          and(
            eq(trackable_record.id, entry.id),
            eq(trackable_record.user_id, user_id),
          ),
        );
      break;
    }
  }
};

// ============================================================================
// TRACKABLE GROUP
// ============================================================================

const trackableGroupFromClientId = (id: SyncEntry["id"]) => {
  const spl = id.split("|");

  if (spl.length != 3 || spl.some((s) => !s)) {
    throw new Error("Invalid trackable group id: " + id);
  }

  return { trackable_id: spl[1]!, group: spl[2]! };
};

export const applyCrudTrackableGroup = async (
  entry: SyncEntry,
  user_id: string,
) => {
  const { opData } = entry;

  switch (entry.op) {
    case UpdateType.PUT: {
      const verified = trackable_group_insert_schema.parse({
        ...opData,
        user_id,
      });

      await db.insert(trackable_group).values(verified).onConflictDoNothing();
      break;
    }
    case UpdateType.PATCH: {
      const verified = trackable_group_update_schema.parse(opData);

      if (!verified.trackable_id || !verified.group) {
        console.error(
          "trying to patch trackable group with invalid data",
          verified,
        );
        return;
      }

      await db
        .update(trackable_group)
        .set(verified)
        .where(
          and(
            eq(trackable_group.trackable_id, verified.trackable_id),
            eq(trackable_group.user_id, user_id),
            eq(trackable_group.group, verified.group),
          ),
        );
      break;
    }
    case UpdateType.DELETE: {
      const dataFromId = trackableGroupFromClientId(entry.id);
      await db
        .delete(trackable_group)
        .where(
          and(
            eq(trackable_group.user_id, user_id),
            eq(trackable_group.trackable_id, dataFromId.trackable_id),
            eq(trackable_group.group, dataFromId.group),
          ),
        );
      break;
    }
  }
};

// ============================================================================
// USER FLAGS
// ============================================================================

const userFlagsFromClientID = (id: SyncEntry["id"]) => {
  const spl = id.split("|");

  if (spl.length != 2 || spl.some((s) => !s)) {
    throw new Error("Invalid user flags id: " + id);
  }

  return { key: spl[1]! };
};

export const applyCrudUserFlags = async (entry: SyncEntry, user_id: string) => {
  const { opData } = entry;

  switch (entry.op) {
    case UpdateType.PUT: {
      const verified = user_flags_insert_schema.parse({
        ...opData,
        user_id,
      });

      await db
        .insert(user_flags)
        .values(verified)
        .onConflictDoUpdate({
          target: [user_flags.user_id, user_flags.key],
          set: { value: verified.value },
        });
      break;
    }
    case UpdateType.PATCH: {
      const verified = user_flags_update_schema.parse(opData);

      if (!verified.key) {
        console.error("trying to patch flag without key");
        return;
      }

      await db
        .update(user_flags)
        .set({ value: verified.value })
        .where(
          and(
            eq(user_flags.key, verified.key),
            eq(user_flags.user_id, user_id),
          ),
        );
      break;
    }
    case UpdateType.DELETE: {
      const dataFromId = userFlagsFromClientID(entry.id);

      await db
        .delete(user_flags)
        .where(
          and(
            eq(user_flags.key, dataFromId.key),
            eq(user_flags.user_id, user_id),
          ),
        );
      break;
    }
  }
};
