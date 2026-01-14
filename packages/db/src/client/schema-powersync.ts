// * This is schema for local sqlite db that powersync replicated to */
import {
  DrizzleAppSchema,
  PowerSyncSQLiteDatabase,
} from "@powersync/drizzle-driver";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userFlags = sqliteTable("TYL_userFlags", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  key: text("key").notNull(),
  value: text("value").notNull(),
});

export const trackable = sqliteTable("TYL_trackable", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  type: text("type").notNull(),
  name: text("name").notNull(),
});

export const trackableFlags = sqliteTable("TYL_trackableFlags", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  trackable_id: text("trackable_id").notNull(),
  key: text("key").notNull(),
  value: text("value").notNull(),
});

export const trackableRecord = sqliteTable("TYL_trackableRecord", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  date: text("date").notNull(),
  trackable_id: text("trackable_id").notNull(),
  value: text("value").notNull(),
  attributes: text("attributes").notNull(),
  created_at: integer("created_at").notNull(),
  updated_at: integer("updated_at").notNull(),
  external_key: text("external_key").notNull(),
});

export const trackableGroup = sqliteTable("TYL_trackableGroup", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  trackable_id: text("trackable_id").notNull(),
  group: text("group").notNull(),
});

export const PowersyncDrizzleSchema = {
  trackable: trackable,
  trackableFlags: trackableFlags,
  trackableRecord: trackableRecord,
  trackableGroup: trackableGroup,
  userFlags: userFlags,
};

export const PowersyncSchema = new DrizzleAppSchema(PowersyncDrizzleSchema);

export type TPowersyncDatabase = (typeof PowersyncSchema)["types"];

export type TPowersyncDrizzleDB = PowerSyncSQLiteDatabase<
  typeof PowersyncDrizzleSchema
>;

export type DbTrackableFlagsUpsert = (typeof trackableFlags.$inferInsert)