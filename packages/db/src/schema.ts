import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  json,
  jsonb,
  pgEnum,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { session, user } from "./auth";

export * from "./auth";

const pgTable = pgTableCreator((name) => `TYL_${name}`);

/*
 * Tables related to user.
 */
export const userFlags = pgTable(
  "userFlags",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    value: json("value").default({}),
  },
  (t) => [primaryKey({ columns: [t.userId, t.key] })],
);

export const userFlagsRelations = relations(userFlags, ({ one }) => ({
  user: one(user, {
    fields: [userFlags.userId],
    references: [user.id],
  }),
}));

// Add to existing user relations or create if doesn't exist
export const userRelations = relations(user, ({ many }) => ({
  flags: many(userFlags),
}));

/*
 * TRACKABLES
 */

export const trackableTypeEnum = pgEnum("type", [
  "boolean",
  "number",
  "text",
  "tags",
  "logs",
]);

export const trackable = pgTable(
  "trackable",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    type: trackableTypeEnum("type").notNull(),
  },
  (t) => [
    uniqueIndex("user_id_idx").on(t.userId, t.id),
    index("user_id_name_idx").on(t.userId, t.name),
  ],
);

/*
 * Settings and additional information about trackable.
 */
export const trackableFlags = pgTable(
  "trackableFlags",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    trackableId: uuid("trackable_id")
      .notNull()
      .references(() => trackable.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    value: json("value").default({}),
  },
  (t) => [primaryKey({ columns: [t.userId, t.trackableId, t.key] })],
);

export const trackableFlagsRelations = relations(trackableFlags, ({ one }) => ({
  trackable: one(trackable, {
    fields: [trackableFlags.trackableId],
    references: [trackable.id],
  }),
}));

export const trackableRelations = relations(trackable, ({ many }) => ({
  data: many(trackableRecord),
  flags: many(trackableFlags),
}));

export const trackableRecord = pgTable(
  "trackableRecord",
  {
    recordId: uuid("record_id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    trackableId: uuid("trackable_id")
      .notNull()
      .references(() => trackable.id, { onDelete: "cascade" }),
    date: timestamp("date").notNull(),
    value: text("value").notNull(),
    /**
     * Attributes stored as JSONB, it's always a map of string to string.
     */
    attributes: jsonb("attributes").default({}).$type<Record<string, string>>(),

    /*
     * Only for trackables that allow multiple records per day, used to sort records.
     * Since this application is local first and insert to PG can differ from actual creation date, value is set by the client.
     * Stored as unix timestamp to avoid timezone issues and simplify sorting.
     */
    createdAt: bigint("created_at", { mode: "number" }),
    /*
     * Used to unserstand when value was written to compare db with lazy input. Also used to choose newer record when ingesting data.
     Stored as unix timestamp to avoid timezone issues and simplify sorting.
     */
    updatedAt: bigint("updated_at", { mode: "number" }),
    /*
     * Set by external systems to identify the source of the record.
     */
    externalKey: text("external_key"),
  },
  (t) => [
    /*
     This table has an additional trigger written manually in 0030_trigger_v3.sql. It makes it so:
     - Simple trackables (boolean, number, text) can only have one record per day.
      - On insert date is truncated to hour 0 minute 0 second 0.
      - If after truncating there is an existing record for that day, it gets updated instead.
     - Tags must be unique. If on insert there is an existing tag with the same value, the insert is cancelled.
    */
    index("trackable_date_idx").on(t.trackableId, t.date),
    index("user_date_idx").on(t.userId, t.date),
  ],
);

export const trackableRecordAttributesTypeEnum = pgEnum("attributeType", [
  "boolean",
  "number",
  "text",
]);

export const trackableRecordAttributes = pgTable(
  "trackableRecordAttributes",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    trackableId: uuid("trackable_id")
      .notNull()
      .references(() => trackable.id, { onDelete: "cascade" }),
    recordId: uuid("record_id")
      .notNull()
      .references(() => trackableRecord.recordId, { onDelete: "cascade" }),
    key: text("key").notNull(),
    value: text("value"),
    type: trackableRecordAttributesTypeEnum("type").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.trackableId, t.recordId, t.key] }),
  ],
);

export const recordRelations = relations(trackableRecord, ({ one }) => ({
  trackableId: one(trackable, {
    fields: [trackableRecord.trackableId],
    references: [trackable.id],
  }),
  userId: one(user, {
    fields: [trackableRecord.userId],
    references: [user.id],
  }),
}));

export const trackableGroup = pgTable(
  "trackableGroup",
  {
    trackableId: uuid("trackable_id")
      .notNull()
      .references(() => trackable.id, { onDelete: "cascade" }),
    group: text("group").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.trackableId, t.group] })],
);

export const trackableGroupRelations = relations(trackableGroup, ({ one }) => ({
  trackable: one(trackable, {
    fields: [trackableGroup.trackableId],
    references: [trackable.id],
  }),
  user: one(user, {
    fields: [trackableGroup.userId],
    references: [user.id],
  }),
}));

export type DbUserSelect = typeof user.$inferSelect;
export type DbSessionSelect = typeof session.$inferSelect;

export type DbTrackableSelect = typeof trackable.$inferSelect;
export type DbTrackableInsert = typeof trackable.$inferInsert;

export type DbTrackableRecordSelect = typeof trackableRecord.$inferSelect;
export type DbTrackableRecordInsert = typeof trackableRecord.$inferInsert;

export type DbTrackableFlagsSelect = typeof trackableFlags.$inferSelect;
export type DbTrackableFlagsInsert = typeof trackableFlags.$inferInsert;

export type DbUserFlagsSelect = typeof userFlags.$inferSelect;
export type DbUserFlagsInsert = typeof userFlags.$inferInsert;
