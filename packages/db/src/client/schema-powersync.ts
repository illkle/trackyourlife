// * This is schema for local sqlite db that powersync replicated to */
import { DrizzleAppSchema, PowerSyncSQLiteDatabase } from "@powersync/drizzle-driver";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const user_flags = sqliteTable("TYL_userFlags", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  key: text("key").notNull(),
  value: text("value").notNull(),
});

export const trackable = sqliteTable("TYL_trackable", {
  id: text("id").unique().primaryKey(),
  user_id: text("user_id").notNull(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  bucketing: text("bucketing").notNull(),
});

export const trackable_flags = sqliteTable("TYL_trackableFlags", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  trackable_id: text("trackable_id").notNull(),
  key: text("key").notNull(),
  value: text("value").notNull(),
});

export const trackable_record = sqliteTable("TYL_trackableRecord", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  timestamp: text("timestamp").notNull(),
  time_bucket: text("time_bucket"),
  trackable_id: text("trackable_id").notNull(),
  value: text("value").notNull(),
  external_key: text("external_key"),
  updated_at: integer("updated_at"),
});

export const trackable_group = sqliteTable("TYL_trackableGroup", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  trackable_id: text("trackable_id").notNull(),
  group: text("group").notNull(),
});

export const trackable_relations = relations(trackable, ({ many }) => ({
  data: many(trackable_record),
  flags: many(trackable_flags),
  groups: many(trackable_group),
}));

export const trackable_group_relations = relations(trackable_group, ({ one }) => ({
  trackable: one(trackable, {
    fields: [trackable_group.trackable_id],
    references: [trackable.id],
  }),
}));

export const record_relations = relations(trackable_record, ({ one }) => ({
  trackable: one(trackable, {
    fields: [trackable_record.trackable_id],
    references: [trackable.id],
  }),
}));

export const trackable_flags_relations = relations(trackable_flags, ({ one }) => ({
  trackable: one(trackable, {
    fields: [trackable_flags.trackable_id],
    references: [trackable.id],
  }),
}));

export const PowersyncDrizzleSchema = {
  trackable: trackable,
  trackableFlags: trackable_flags,
  trackableRecord: trackable_record,
  trackableGroup: trackable_group,
  userFlags: user_flags,
  trackable_flags_relations,
  trackable_group_relations,
  trackable_relations,
  record_relations,
};

export const PowersyncSchema = new DrizzleAppSchema(PowersyncDrizzleSchema);

export type TPowersyncDatabase = (typeof PowersyncSchema)["types"];

export type TPowersyncDrizzleDB = PowerSyncSQLiteDatabase<typeof PowersyncDrizzleSchema>;

export type DbTrackableFlagsUpsert = typeof trackable_flags.$inferInsert;

export type DbTrackableSelect = typeof trackable.$inferSelect;
export type DbTrackableInsert = typeof trackable.$inferInsert;

export type DbTrackableRecordSelect = typeof trackable_record.$inferSelect;
export type DbTrackableRecordInsert = typeof trackable_record.$inferInsert;

export type DbTrackableFlagsSelect = typeof trackable_flags.$inferSelect;
export type DbTrackableFlagsInsert = typeof trackable_flags.$inferInsert;
export type DbTrackableFlagsDelete = Omit<DbTrackableFlagsInsert, "value">;

export type DbTrackableGroupSelect = typeof trackable_group.$inferSelect;
export type DbTrackableGroupInsert = typeof trackable_group.$inferInsert;

export type DbUserFlagsSelect = typeof user_flags.$inferSelect;
export type DbUserFlagsInsert = typeof user_flags.$inferInsert;
