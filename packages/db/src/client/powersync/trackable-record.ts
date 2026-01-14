/**
 * Trackable record queries and mutations
 */

import { and, asc, eq, gte, lte } from "drizzle-orm";

import type { TPowersyncDrizzleDB } from "../schema-powersync";
import { trackableRecord } from "../schema-powersync";

// ============================================================================
// Types
// ============================================================================

export interface RecordInsertParams {
  id: string;
  user_id: string;
  trackable_id: string;
  date: string;
  value: string;
  attributes?: string;
  external_key?: string;
}

export interface RecordUpdateParams {
  id: string;
  value: string;
  updated_at?: number;
}

// ============================================================================
// Queries
// ============================================================================

/** Query trackable records within a date range (dates as ISO strings) */
export const queryTrackableRecords = (
  db: TPowersyncDrizzleDB,
  trackableId: string,
  startDate: string,
  endDate: string,
) => {
  return db.query.trackableRecord.findMany({
    where: and(
      eq(trackableRecord.trackable_id, trackableId),
      gte(trackableRecord.date, startDate),
      lte(trackableRecord.date, endDate),
    ),
    orderBy: [asc(trackableRecord.date), asc(trackableRecord.created_at)],
  });
};

/** Query all records within a date range (for all trackables) */
export const queryRecordsInRange = (
  db: TPowersyncDrizzleDB,
  startDate: string,
  endDate: string,
) => {
  return db.query.trackableRecord.findMany({
    where: and(
      gte(trackableRecord.date, startDate),
      lte(trackableRecord.date, endDate),
    ),
    orderBy: [asc(trackableRecord.date), asc(trackableRecord.created_at)],
  });
};

/** Query all trackable records for a trackable (no date filter) */
export const queryAllTrackableRecords = (
  db: TPowersyncDrizzleDB,
  trackableId: string,
) => {
  return db.query.trackableRecord.findMany({
    where: eq(trackableRecord.trackable_id, trackableId),
    orderBy: [asc(trackableRecord.date), asc(trackableRecord.created_at)],
  });
};

// ============================================================================
// Mutations
// ============================================================================

export const insertRecord = async (
  db: TPowersyncDrizzleDB,
  params: RecordInsertParams,
) => {
  const now = Date.now();
  await db.insert(trackableRecord).values({
    id: params.id,
    user_id: params.user_id,
    trackable_id: params.trackable_id,
    date: params.date,
    value: params.value,
    attributes: params.attributes ?? "{}",
    external_key: params.external_key ?? "",
    created_at: now,
    updated_at: now,
  });
  return params.id;
};

export const updateRecord = async (
  db: TPowersyncDrizzleDB,
  params: RecordUpdateParams,
) => {
  await db
    .update(trackableRecord)
    .set({
      value: params.value,
      updated_at: params.updated_at ?? Date.now(),
    })
    .where(eq(trackableRecord.id, params.id));
};

export const upsertRecord = async (
  db: TPowersyncDrizzleDB,
  params: RecordInsertParams,
) => {
  const now = Date.now();
  const existing = await db.query.trackableRecord.findFirst({
    where: eq(trackableRecord.id, params.id),
  });

  if (existing) {
    await db
      .update(trackableRecord)
      .set({
        value: params.value,
        updated_at: now,
      })
      .where(eq(trackableRecord.id, params.id));
  } else {
    await db.insert(trackableRecord).values({
      id: params.id,
      user_id: params.user_id,
      trackable_id: params.trackable_id,
      date: params.date,
      value: params.value,
      attributes: params.attributes ?? "{}",
      external_key: params.external_key ?? "",
      created_at: now,
      updated_at: now,
    });
  }
  return params.id;
};

export const deleteRecord = async (db: TPowersyncDrizzleDB, id: string) => {
  await db.delete(trackableRecord).where(eq(trackableRecord.id, id));
};
