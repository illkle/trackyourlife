// * This is schema for local sqlite db that powersync replicated to */
import { DrizzleAppSchema } from "@powersync/drizzle-driver";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const ps_user = sqliteTable("TYL_user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  email_verified: integer("email_verified").notNull(),
  image: text("image"),
});

const ps_userFlags = sqliteTable("TYL_userFlags", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  key: text("key").notNull(),
  value: text("value").notNull(),
});

const ps_trackable = sqliteTable("TYL_trackable", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  type: text("type").notNull(),
  name: text("name").notNull(),
});

const ps_trackableFlags = sqliteTable("TYL_trackableFlags", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  trackable_id: text("trackable_id").notNull(),
  key: text("key").notNull(),
  value: text("value").notNull(),
});

const ps_trackableRecord = sqliteTable("TYL_trackableRecord", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  date: text("date").notNull(),
  trackable_id: text("trackable_id").notNull(),
  value: text("value").notNull(),
  attributes: text("attributes").notNull(),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
  external_key: text("external_key").notNull(),
});

const ps_trackableGroup = sqliteTable("TYL_trackableGroup", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  trackable_id: text("trackable_id").notNull(),
  group: text("group").notNull(),
});

export const PowersyncDrizzleSchema = {
  trackable: ps_trackable,
  trackableFlags: ps_trackableFlags,
  trackableRecord: ps_trackableRecord,
  trackableGroup: ps_trackableGroup,
  user: ps_user,
  userFlags: ps_userFlags,
};

export const PowersyncSchema = new DrizzleAppSchema(PowersyncDrizzleSchema);

export type PowersyncDatabase = (typeof PowersyncSchema)["types"];
