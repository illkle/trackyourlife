/**
 * Trackable group queries and mutations
 */

import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import type { TPowersyncDrizzleDB } from "../schema-powersync";
import { trackableGroup } from "../schema-powersync";

// ============================================================================
// Types
// ============================================================================

export interface GroupParams {
  user_id: string;
  trackable_id: string;
  group: string;
}

// ============================================================================
// Queries
// ============================================================================

/** Query trackable groups for a specific trackable */
export const queryTrackableGroups = (
  db: TPowersyncDrizzleDB,
  trackableId: string,
) => {
  return db.query.trackableGroup.findMany({
    where: eq(trackableGroup.trackable_id, trackableId),
  });
};

/** Query all groups */
export const queryAllGroups = (db: TPowersyncDrizzleDB) => {
  return db.query.trackableGroup.findMany();
};

/** Query all trackables in a specific group */
export const queryGroupList = (db: TPowersyncDrizzleDB, group: string) => {
  return db.query.trackableGroup.findMany({
    where: eq(trackableGroup.group, group),
  });
};

/** Query to check if a trackable is in a specific group */
export const queryTrackableInGroup = (
  db: TPowersyncDrizzleDB,
  trackableId: string,
  group: string,
) => {
  return db.query.trackableGroup.findFirst({
    where: and(
      eq(trackableGroup.trackable_id, trackableId),
      eq(trackableGroup.group, group),
    ),
  });
};

// ============================================================================
// Mutations
// ============================================================================

export const insertGroup = async (
  db: TPowersyncDrizzleDB,
  params: GroupParams,
) => {
  const id = uuidv4();
  await db.insert(trackableGroup).values({
    id,
    user_id: params.user_id,
    trackable_id: params.trackable_id,
    group: params.group,
  });
  return id;
};

export const deleteGroup = async (
  db: TPowersyncDrizzleDB,
  params: GroupParams,
) => {
  await db
    .delete(trackableGroup)
    .where(
      and(
        eq(trackableGroup.trackable_id, params.trackable_id),
        eq(trackableGroup.group, params.group),
      ),
    );
};

export const upsertGroup = async (
  db: TPowersyncDrizzleDB,
  params: GroupParams,
) => {
  const existing = await db.query.trackableGroup.findFirst({
    where: and(
      eq(trackableGroup.trackable_id, params.trackable_id),
      eq(trackableGroup.group, params.group),
    ),
  });

  if (!existing) {
    return insertGroup(db, params);
  }
  return existing.id;
};
