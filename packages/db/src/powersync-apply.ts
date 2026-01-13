import { CrudBatch, UpdateType } from "@powersync/common";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from ".";
import {
  trackable,
  trackableFlags,
  trackableFlagsInsertSchema,
  trackableFlagsUpdateSchema,
  trackableGroup,
  trackableGroupInsertSchema,
  trackableGroupUpdateSchema,
  trackableInsertSchema,
  trackableRecord,
  trackableRecordInsertSchema,
  trackableRecordUpdateSchema,
  trackableUpdateSchema,
  userFlags,
  userFlagsInsertSchema,
  userFlagsUpdateSchema,
} from "./schema";

const onlyIdRequiredSchema = z.object({
  id: z.string(),
});

// ============================================================================
// TRACKABLE
// ============================================================================

export const applyCrudTrackable = async (
  entry: CrudBatch["crud"][number],
  userId: string,
) => {
  switch (entry.op) {
    case UpdateType.PUT: {
      const verified = trackableInsertSchema.parse(entry.opData);

      await db.insert(trackable).values({
        ...verified,
        userId,
      });
      break;
    }
    case UpdateType.PATCH: {
      const verified = trackableUpdateSchema.parse(entry.opData);

      if (!verified.id) {
        throw new Error("Trackable ID is required");
      }

      await db
        .update(trackable)
        .set(verified)
        .where(
          and(eq(trackable.id, verified.id), eq(trackable.userId, userId)),
        );
      break;
    }
    case UpdateType.DELETE: {
      const verified = onlyIdRequiredSchema.parse(entry.opData);

      await db
        .delete(trackable)
        .where(
          and(eq(trackable.id, verified.id), eq(trackable.userId, userId)),
        );
      break;
    }
  }
};

// ============================================================================
// TRACKABLE FLAGS (composite PK: userId, trackableId, key)
// ============================================================================

export const applyCrudTrackableFlags = async (
  entry: CrudBatch["crud"][number],
  userId: string,
) => {
  const opData = entry.opData as Record<string, unknown>;

  switch (entry.op) {
    case UpdateType.PUT: {
      const verified = trackableFlagsInsertSchema.parse({
        trackableId: opData.trackable_id,
        key: opData.key,
        value: opData.value ? JSON.parse(opData.value as string) : undefined,
        userId,
      });

      await db
        .insert(trackableFlags)
        .values(verified)
        .onConflictDoUpdate({
          target: [
            trackableFlags.userId,
            trackableFlags.trackableId,
            trackableFlags.key,
          ],
          set: { value: verified.value },
        });
      break;
    }
    case UpdateType.PATCH: {
      const verified = trackableFlagsUpdateSchema.parse({
        trackableId: opData.trackable_id,
        key: opData.key,
        value: opData.value ? JSON.parse(opData.value as string) : undefined,
        userId,
      });

      if (!verified.trackableId || !verified.key) {
        throw new Error("TrackableId and key are required for update");
      }

      await db
        .update(trackableFlags)
        .set({ value: verified.value })
        .where(
          and(
            eq(trackableFlags.userId, userId),
            eq(trackableFlags.trackableId, verified.trackableId),
            eq(trackableFlags.key, verified.key),
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
        .delete(trackableFlags)
        .where(
          and(
            eq(trackableFlags.userId, userId),
            eq(trackableFlags.trackableId, trackableId),
            eq(trackableFlags.key, key),
          ),
        );
      break;
    }
  }
};

// ============================================================================
// TRACKABLE RECORD (PK: recordId)
// ============================================================================

export const applyCrudTrackableRecord = async (
  entry: CrudBatch["crud"][number],
  userId: string,
) => {
  const opData = entry.opData as Record<string, unknown>;

  switch (entry.op) {
    case UpdateType.PUT: {
      const verified = trackableRecordInsertSchema.parse({
        recordId: opData.id,
        trackableId: opData.trackable_id,
        date: opData.date ? new Date(opData.date as string) : undefined,
        value: opData.value,
        attributes: opData.attributes
          ? JSON.parse(opData.attributes as string)
          : undefined,
        createdAt: opData.created_at ? Number(opData.created_at) : undefined,
        updatedAt: opData.updated_at ? Number(opData.updated_at) : undefined,
        externalKey: opData.external_key,
        userId,
      });

      await db.insert(trackableRecord).values(verified);
      break;
    }
    case UpdateType.PATCH: {
      const verified = trackableRecordUpdateSchema.parse({
        recordId: opData.id,
        trackableId: opData.trackable_id,
        date: opData.date ? new Date(opData.date as string) : undefined,
        value: opData.value,
        attributes: opData.attributes
          ? JSON.parse(opData.attributes as string)
          : undefined,
        createdAt: opData.created_at ? Number(opData.created_at) : undefined,
        updatedAt: opData.updated_at ? Number(opData.updated_at) : undefined,
        externalKey: opData.external_key,
        userId,
      });

      if (!verified.recordId) {
        throw new Error("RecordId is required for update");
      }

      await db
        .update(trackableRecord)
        .set(verified)
        .where(
          and(
            eq(trackableRecord.recordId, verified.recordId),
            eq(trackableRecord.userId, userId),
          ),
        );
      break;
    }
    case UpdateType.DELETE: {
      const recordId = opData.id as string;

      if (!recordId) {
        throw new Error("RecordId is required for delete");
      }

      await db
        .delete(trackableRecord)
        .where(
          and(
            eq(trackableRecord.recordId, recordId),
            eq(trackableRecord.userId, userId),
          ),
        );
      break;
    }
  }
};

// ============================================================================
// TRACKABLE GROUP (composite PK: trackableId, group)
// ============================================================================

export const applyCrudTrackableGroup = async (
  entry: CrudBatch["crud"][number],
  userId: string,
) => {
  const opData = entry.opData as Record<string, unknown>;

  switch (entry.op) {
    case UpdateType.PUT: {
      const verified = trackableGroupInsertSchema.parse({
        trackableId: opData.trackable_id,
        group: opData.group,
        userId,
      });

      await db.insert(trackableGroup).values(verified).onConflictDoNothing();
      break;
    }
    case UpdateType.PATCH: {
      // TrackableGroup only has trackableId, group, and userId
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
        .delete(trackableGroup)
        .where(
          and(
            eq(trackableGroup.userId, userId),
            eq(trackableGroup.trackableId, trackableId),
            eq(trackableGroup.group, group),
          ),
        );
      break;
    }
  }
};

// ============================================================================
// USER FLAGS (composite PK: userId, key)
// ============================================================================

export const applyCrudUserFlags = async (
  entry: CrudBatch["crud"][number],
  userId: string,
) => {
  const opData = entry.opData as Record<string, unknown>;

  switch (entry.op) {
    case UpdateType.PUT: {
      const verified = userFlagsInsertSchema.parse({
        key: opData.key,
        value: opData.value ? JSON.parse(opData.value as string) : undefined,
        userId,
      });

      await db
        .insert(userFlags)
        .values(verified)
        .onConflictDoUpdate({
          target: [userFlags.userId, userFlags.key],
          set: { value: verified.value },
        });
      break;
    }
    case UpdateType.PATCH: {
      const verified = userFlagsUpdateSchema.parse({
        key: opData.key,
        value: opData.value ? JSON.parse(opData.value as string) : undefined,
        userId,
      });

      if (!verified.key) {
        throw new Error("Key is required for update");
      }

      await db
        .update(userFlags)
        .set({ value: verified.value })
        .where(
          and(eq(userFlags.userId, userId), eq(userFlags.key, verified.key)),
        );
      break;
    }
    case UpdateType.DELETE: {
      const key = opData.key as string;

      if (!key) {
        throw new Error("Key is required for delete");
      }

      await db
        .delete(userFlags)
        .where(and(eq(userFlags.userId, userId), eq(userFlags.key, key)));
      break;
    }
  }
};
