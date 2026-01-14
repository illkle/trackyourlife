/**
 * Trackable flags queries and mutations
 */

import { and, eq, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import type { TPowersyncDrizzleDB } from "../schema-powersync";
import { trackableFlags } from "../schema-powersync";

// ============================================================================
// Types
// ============================================================================

export interface FlagUpsertParams {
  user_id: string;
  trackable_id: string;
  key: string;
  value: string;
}

export interface FlagDeleteParams {
  trackable_id: string;
  key: string;
}

// ============================================================================
// Queries
// ============================================================================

/** Query all trackable flags */
export const queryAllFlags = (db: TPowersyncDrizzleDB) => {
  return db.query.trackableFlags.findMany();
};

/** Query trackable flags for specific trackable IDs */
export const queryFlagsForTrackables = (
  db: TPowersyncDrizzleDB,
  trackableIds: string[],
) => {
  if (trackableIds.length === 0) {
    return db.query.trackableFlags.findMany();
  }
  return db.query.trackableFlags.findMany({
    where: inArray(trackableFlags.trackable_id, trackableIds),
  });
};

/** Query flags for a single trackable */
export const queryTrackableFlags = (
  db: TPowersyncDrizzleDB,
  trackableId: string,
) => {
  return db.query.trackableFlags.findMany({
    where: eq(trackableFlags.trackable_id, trackableId),
  });
};

// ============================================================================
// Mutations
// ============================================================================

export const upsertFlag = async (
  db: TPowersyncDrizzleDB,
  params: FlagUpsertParams,
) => {
  const existing = await db.query.trackableFlags.findFirst({
    where: and(
      eq(trackableFlags.trackable_id, params.trackable_id),
      eq(trackableFlags.key, params.key),
    ),
  });

  if (existing) {
    await db
      .update(trackableFlags)
      .set({ value: params.value })
      .where(eq(trackableFlags.id, existing.id));
    return existing.id;
  } else {
    const id = uuidv4();
    await db.insert(trackableFlags).values({
      id,
      user_id: params.user_id,
      trackable_id: params.trackable_id,
      key: params.key,
      value: params.value,
    });
    return id;
  }
};

export const deleteFlag = async (
  db: TPowersyncDrizzleDB,
  params: FlagDeleteParams,
) => {
  await db
    .delete(trackableFlags)
    .where(
      and(
        eq(trackableFlags.trackable_id, params.trackable_id),
        eq(trackableFlags.key, params.key),
      ),
    );
};
