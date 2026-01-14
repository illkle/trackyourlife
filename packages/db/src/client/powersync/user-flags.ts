/**
 * User flags queries and mutations
 */

import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import type { TPowersyncDrizzleDB } from "../schema-powersync";
import { userFlags } from "../schema-powersync";

// ============================================================================
// Types
// ============================================================================

export interface UserFlagUpsertParams {
  user_id: string;
  key: string;
  value: string;
}

// ============================================================================
// Queries
// ============================================================================

/** Query all user flags */
export const queryUserFlags = (db: TPowersyncDrizzleDB) => {
  return db.query.userFlags.findMany();
};

/** Query a specific user flag by key */
export const queryUserFlag = (db: TPowersyncDrizzleDB, key: string) => {
  return db.query.userFlags.findFirst({
    where: eq(userFlags.key, key),
  });
};

// ============================================================================
// Mutations
// ============================================================================

export const upsertUserFlag = async (
  db: TPowersyncDrizzleDB,
  params: UserFlagUpsertParams,
) => {
  const existing = await db.query.userFlags.findFirst({
    where: eq(userFlags.key, params.key),
  });

  if (existing) {
    await db
      .update(userFlags)
      .set({ value: params.value })
      .where(eq(userFlags.id, existing.id));
    return existing.id;
  } else {
    const id = uuidv4();
    await db.insert(userFlags).values({
      id,
      user_id: params.user_id,
      key: params.key,
      value: params.value,
    });
    return id;
  }
};

export const deleteUserFlag = async (db: TPowersyncDrizzleDB, key: string) => {
  await db.delete(userFlags).where(eq(userFlags.key, key));
};
