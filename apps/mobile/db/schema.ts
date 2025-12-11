import { DrizzleAppSchema } from "@powersync/drizzle-driver";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const TYL_user = sqliteTable("TYL_user", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  emailVerified: integer("emailVerified").notNull(),
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
});

export const TYL_trackable = sqliteTable("TYL_trackable", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  type: text("type").notNull(),
  name: text("name").notNull(),
});

export const TYL_trackableRecord = sqliteTable("TYL_trackableRecord", {
  id: text("id").primaryKey(),
  trackableId: text("trackableId").notNull(),
  date: text("date").notNull(),
  value: text("value").notNull(),
  user_id: text("user_id").notNull(),
  recordId: text("recordId").notNull(),
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
  attributes: text("attributes").notNull(),
});

export const drizzleSchema = {
  TYL_user,
  TYL_trackable,
  TYL_trackableRecord,
};

export const AppSchema = new DrizzleAppSchema(drizzleSchema);

export type Database = (typeof AppSchema)["types"];
