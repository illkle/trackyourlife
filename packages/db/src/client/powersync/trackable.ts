/**
 * Trackable queries and mutations
 */

import { asc, eq } from "drizzle-orm";

import type { TPowersyncDrizzleDB } from "../schema-powersync";
import { trackable } from "../schema-powersync";

// ============================================================================
// Types
// ============================================================================

export interface TrackableInsertParams {
  id: string;
  user_id: string;
  name: string;
  type: "boolean" | "number" | "text";
}

export interface TrackableUpdateParams {
  id: string;
  name: string;
}

// ============================================================================
// Queries
// ============================================================================

/** Query all trackables ordered by name */
export const queryTrackablesList = (db: TPowersyncDrizzleDB) => {
  return db.query.trackable.findMany({
    orderBy: asc(trackable.name),
  });
};

/** Query a single trackable by ID */
export const queryTrackableById = (db: TPowersyncDrizzleDB, id: string) => {
  return db.query.trackable.findFirst({
    where: eq(trackable.id, id),
  });
};

// ============================================================================
// Mutations
// ============================================================================

export const insertTrackable = async (
  db: TPowersyncDrizzleDB,
  params: TrackableInsertParams,
) => {
  await db.insert(trackable).values({
    id: params.id,
    user_id: params.user_id,
    name: params.name,
    type: params.type,
  });
  return params.id;
};

export const updateTrackable = async (
  db: TPowersyncDrizzleDB,
  params: TrackableUpdateParams,
) => {
  await db
    .update(trackable)
    .set({ name: params.name })
    .where(eq(trackable.id, params.id));
};

export const deleteTrackable = async (db: TPowersyncDrizzleDB, id: string) => {
  await db.delete(trackable).where(eq(trackable.id, id));
};
