import { relations } from "drizzle-orm";
import {
  bigint,
  index,
  json,
  pgEnum,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

import { session, user } from "./auth";

export * from "./auth";

const pgTable = pgTableCreator((name) => `TYL_${name}`);

/*
 * Tables related to user.
 */
export const user_flags = pgTable(
  "userFlags",
  {
    user_id: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    value: json("value").default({}),
  },
  (t) => [primaryKey({ columns: [t.user_id, t.key] })],
);

export const user_flags_relations = relations(user_flags, ({ one }) => ({
  user: one(user, {
    fields: [user_flags.user_id],
    references: [user.id],
  }),
}));

// Add to existing user relations or create if doesn't exist
export const user_relations = relations(user, ({ many }) => ({
  flags: many(user_flags),
}));

/*
 * TRACKABLES
 */

export const trackable_type_enum = pgEnum("type", [
  "boolean",
  "number",
  "text",
]);

export const trackable = pgTable(
  "trackable",
  {
    user_id: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    type: trackable_type_enum("type").notNull(),
  },
  (t) => [
    uniqueIndex("user_id_idx").on(t.user_id, t.id),
    index("user_id_name_idx").on(t.user_id, t.name),
  ],
);

/*
 * Settings and additional information about trackable.
 */
export const trackable_flags = pgTable(
  "trackableFlags",
  {
    user_id: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    trackable_id: uuid("trackable_id")
      .notNull()
      .references(() => trackable.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    value: json("value").default({}),
  },
  (t) => [primaryKey({ columns: [t.user_id, t.trackable_id, t.key] })],
);

export const trackable_flags_relations = relations(
  trackable_flags,
  ({ one }) => ({
    trackable: one(trackable, {
      fields: [trackable_flags.trackable_id],
      references: [trackable.id],
    }),
  }),
);

export const trackable_relations = relations(trackable, ({ many }) => ({
  data: many(trackable_record),
  flags: many(trackable_flags),
}));

export const trackable_record = pgTable(
  "trackableRecord",
  {
    record_id: uuid("record_id").defaultRandom().primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    trackable_id: uuid("trackable_id")
      .notNull()
      .references(() => trackable.id, { onDelete: "cascade" }),
    date: timestamp("date").notNull(),
    value: text("value").notNull(),

    /*
     * Only for trackables that allow multiple records per day, used to sort records.
     * Since this application is local first and insert to PG can differ from actual creation date, value is set by the client.
     * Stored as unix timestamp to avoid timezone issues and simplify sorting.
     */
    created_at: bigint("created_at", { mode: "number" }),
    /*
     * Used to unserstand when value was written to compare db with lazy input. Also used to choose newer record when ingesting data.
     Stored as unix timestamp to avoid timezone issues and simplify sorting.
     */
    updated_at: bigint("updated_at", { mode: "number" }),
    /*
     * Set by external systems to identify the source of the record.
     */
    external_key: text("external_key"),
  },
  (t) => [
    /*
     This table has an additional trigger written manually in 0030_trigger_v3.sql. It makes it so:
     - Simple trackables (boolean, number, text) can only have one record per day.
      - On insert date is truncated to hour 0 minute 0 second 0.
      - If after truncating there is an existing record for that day, it gets updated instead.
    */
    index("trackable_date_idx").on(t.trackable_id, t.date),
    index("user_date_idx").on(t.user_id, t.date),
  ],
);

export const record_relations = relations(trackable_record, ({ one }) => ({
  trackable_id: one(trackable, {
    fields: [trackable_record.trackable_id],
    references: [trackable.id],
  }),
  user_id: one(user, {
    fields: [trackable_record.user_id],
    references: [user.id],
  }),
}));

export const trackable_group = pgTable(
  "trackableGroup",
  {
    trackable_id: uuid("trackable_id")
      .notNull()
      .references(() => trackable.id, { onDelete: "cascade" }),
    group: text("group").notNull(),
    user_id: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.trackable_id, t.group] })],
);

export const trackable_group_relations = relations(
  trackable_group,
  ({ one }) => ({
    trackable: one(trackable, {
      fields: [trackable_group.trackable_id],
      references: [trackable.id],
    }),
    user: one(user, {
      fields: [trackable_group.user_id],
      references: [user.id],
    }),
  }),
);

export type DbUserSelect = typeof user.$inferSelect;
export type DbSessionSelect = typeof session.$inferSelect;

export type DbTrackableSelect = typeof trackable.$inferSelect;
export type DbTrackableInsert = typeof trackable.$inferInsert;

export type DbTrackableRecordSelect = typeof trackable_record.$inferSelect;
export type DbTrackableRecordInsert = typeof trackable_record.$inferInsert;

export type DbTrackableFlagsSelect = typeof trackable_flags.$inferSelect;
export type DbTrackableFlagsInsert = typeof trackable_flags.$inferInsert;

export type DbUserFlagsSelect = typeof user_flags.$inferSelect;
export type DbUserFlagsInsert = typeof user_flags.$inferInsert;

export const trackable_insert_schema = createInsertSchema(trackable);
export const trackable_update_schema = createUpdateSchema(trackable);

export const trackable_record_insert_schema =
  createInsertSchema(trackable_record);
export const trackable_record_update_schema =
  createUpdateSchema(trackable_record);

export const trackable_flags_insert_schema =
  createInsertSchema(trackable_flags);
export const trackable_flags_update_schema =
  createUpdateSchema(trackable_flags);

export const user_flags_insert_schema = createInsertSchema(user_flags);
export const user_flags_update_schema = createUpdateSchema(user_flags);

export const trackable_group_insert_schema =
  createInsertSchema(trackable_group);
export const trackable_group_update_schema =
  createUpdateSchema(trackable_group);
