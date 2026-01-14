import { CrudBatch, UpdateType } from "@powersync/common";
import { and, eq } from "drizzle-orm";

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

export const applyCrudTrackable = async (entry: SyncEntry, userId: string) => {
  switch (entry.op) {
    case UpdateType.PUT: {
      const verified = trackable_insert_schema.parse(entry.opData);

      await db.insert(trackable).values({
        ...verified,
        user_id: userId,
      });
      break;
    }
    case UpdateType.PATCH: {
      const verified = trackable_update_schema.parse(entry.opData);

      await db
        .update(trackable)
        .set(verified)
        .where(and(eq(trackable.id, entry.id), eq(trackable.user_id, userId)));
      break;
    }
    case UpdateType.DELETE: {
      await db
        .delete(trackable)
        .where(and(eq(trackable.id, entry.id), eq(trackable.user_id, userId)));
      break;
    }
  }
};

// ============================================================================
// TRACKABLE FLAGS (composite PK: user_id, trackable_id, key)
// ============================================================================

export const applyCrudTrackableFlags = async (
  entry: SyncEntry,
  userId: string,
) => {
  const opData = entry.opData as Record<string, unknown>;

  switch (entry.op) {
    case UpdateType.PUT: {
      const verified = trackable_flags_insert_schema.parse({
        trackable_id: opData.trackable_id,
        key: opData.key,
        value: opData.value ? JSON.parse(opData.value as string) : undefined,
        user_id: userId,
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
      const verified = trackable_flags_update_schema.parse({
        trackable_id: opData.trackable_id,
        key: opData.key,
        value: opData.value ? JSON.parse(opData.value as string) : undefined,
        user_id: userId,
      });

      if (!verified.trackable_id || !verified.key) {
        throw new Error("TrackableId and key are required for update");
      }

      await db
        .update(trackable_flags)
        .set({ value: verified.value })
        .where(
          and(
            eq(trackable_flags.user_id, userId),
            eq(trackable_flags.trackable_id, verified.trackable_id),
            eq(trackable_flags.key, verified.key),
          ),
        );
      break;
    }
    case UpdateType.DELETE: {
      const trackableId = opData.trackable_id as string;
      const key = opData.key as string;

      if (!trackableId || !key) {
        throw new Error("TrackableId and key are required for delete");
      }

      await db
        .delete(trackable_flags)
        .where(
          and(
            eq(trackable_flags.user_id, userId),
            eq(trackable_flags.trackable_id, trackableId),
            eq(trackable_flags.key, key),
          ),
        );
      break;
    }
  }
};

// ============================================================================
// TRACKABLE RECORD (PK: record_id)
// ============================================================================

export const applyCrudTrackableRecord = async (
  entry: SyncEntry,
  userId: string,
) => {
  const opData = entry.opData as Record<string, unknown>;

  switch (entry.op) {
    case UpdateType.PUT: {
      const verified = trackable_record_insert_schema.parse({
        record_id: opData.id,
        trackable_id: opData.trackable_id,
        date: opData.date ? new Date(opData.date as string) : undefined,
        value: opData.value,
        attributes: opData.attributes
          ? JSON.parse(opData.attributes as string)
          : undefined,
        created_at: opData.created_at ? Number(opData.created_at) : undefined,
        updated_at: opData.updated_at ? Number(opData.updated_at) : undefined,
        external_key: opData.external_key,
        user_id: userId,
      });

      await db.insert(trackable_record).values(verified);
      break;
    }
    case UpdateType.PATCH: {
      const verified = trackable_record_update_schema.parse({
        record_id: opData.id,
        trackable_id: opData.trackable_id,
        date: opData.date ? new Date(opData.date as string) : undefined,
        value: opData.value,
        attributes: opData.attributes
          ? JSON.parse(opData.attributes as string)
          : undefined,
        created_at: opData.created_at ? Number(opData.created_at) : undefined,
        updated_at: opData.updated_at ? Number(opData.updated_at) : undefined,
        external_key: opData.external_key,
        user_id: userId,
      });

      if (!verified.id) {
        throw new Error("RecordId is required for update");
      }

      await db
        .update(trackable_record)
        .set(verified)
        .where(
          and(
            eq(trackable_record.id, verified.id),
            eq(trackable_record.user_id, userId),
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
            eq(trackable_record.user_id, userId),
          ),
        );
      break;
    }
  }
};

// ============================================================================
// TRACKABLE GROUP (composite PK: trackable_id, group)
// ============================================================================

export const applyCrudTrackableGroup = async (
  entry: SyncEntry,
  userId: string,
) => {
  const opData = entry.opData as Record<string, unknown>;

  switch (entry.op) {
    case UpdateType.PUT: {
      const verified = trackable_group_insert_schema.parse({
        trackable_id: opData.trackable_id,
        group: opData.group,
        user_id: userId,
      });

      await db.insert(trackable_group).values(verified).onConflictDoNothing();
      break;
    }
    case UpdateType.PATCH: {
      // TrackableGroup only has trackable_id, group, and user_id
      // No fields to update - the composite key IS the data
      // This is essentially a no-op or could be treated as a re-insert
      break;
    }
    case UpdateType.DELETE: {
      const trackableId = opData.trackable_id as string;
      const group = opData.group as string;

      if (!trackableId || !group) {
        throw new Error("TrackableId and group are required for delete");
      }

      await db
        .delete(trackable_group)
        .where(
          and(
            eq(trackable_group.user_id, userId),
            eq(trackable_group.trackable_id, trackableId),
            eq(trackable_group.group, group),
          ),
        );
      break;
    }
  }
};

// ============================================================================
// USER FLAGS (composite PK: user_id, key)
// ============================================================================

export const applyCrudUserFlags = async (entry: SyncEntry, userId: string) => {
  const opData = entry.opData as Record<string, unknown>;

  switch (entry.op) {
    case UpdateType.PUT: {
      const verified = user_flags_insert_schema.parse({
        key: opData.key,
        value: opData.value ? JSON.parse(opData.value as string) : undefined,
        user_id: userId,
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
      const verified = user_flags_update_schema.parse({
        key: opData.key,
        value: opData.value ? JSON.parse(opData.value as string) : undefined,
        user_id: userId,
      });

      if (!verified.key) {
        throw new Error("Key is required for update");
      }

      await db
        .update(user_flags)
        .set({ value: verified.value })
        .where(
          and(eq(user_flags.user_id, userId), eq(user_flags.key, verified.key)),
        );
      break;
    }
    case UpdateType.DELETE: {
      const key = opData.key as string;

      if (!key) {
        throw new Error("Key is required for delete");
      }

      await db
        .delete(user_flags)
        .where(and(eq(user_flags.user_id, userId), eq(user_flags.key, key)));
      break;
    }
  }
};
