import {
  pgEnum,
  pgTable,
  bigint,
  varchar,
  json,
  uuid,
  date,
  primaryKey,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const auth_user = pgTable("auth_user", {
  id: varchar("id").primaryKey(),

  email: varchar("email").unique().notNull(),
  username: varchar("username").notNull(),

  hashedPassword: varchar("hashed_password").notNull(),

  settings: json("settings").default({}).$type<Record<string, unknown>>(),
  // Currently only used to identify users created by e2e testing
  role: varchar("role"),
});

export const user_session = pgTable("user_session", {
  id: varchar("id").primaryKey(),

  userId: varchar("user_id")
    .notNull()
    .references(() => auth_user.id),

  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const trackableTypeEnum = pgEnum("type", ["boolean", "number", "range"]);

export const trackable = pgTable("trackable", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id")
    .notNull()
    .references(() => auth_user.id, { onDelete: "cascade" }),

  type: trackableTypeEnum("type").notNull(),

  settings: json("settings").default({}),
});

export const trackableRelations = relations(trackable, ({ many }) => ({
  data: many(trackableRecord),
}));

export const trackableRecord = pgTable(
  "trackableRecord",
  {
    trackableId: uuid("trackableId")
      .notNull()
      .references(() => trackable.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    value: varchar("value").notNull(),
    userId: varchar("user_id")
      .notNull()
      .references(() => auth_user.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey(t.trackableId, t.date),
    //unq: unique().on(t.trackableId, t.date).nullsNotDistinct(),
  }),
);

export const recordRelations = relations(trackableRecord, ({ one }) => ({
  trackableId: one(trackable, {
    fields: [trackableRecord.trackableId],
    references: [trackable.id],
  }),
  userId: one(auth_user, {
    fields: [trackableRecord.userId],
    references: [auth_user.id],
  }),
}));

export type DbTrackableSelect = typeof trackable.$inferSelect;
export type DbTrackableInsert = typeof trackable.$inferInsert;

export type DbTrackableRecordSelect = typeof trackableRecord.$inferSelect;
export type DbTrackableRecordInsert = typeof trackableRecord.$inferInsert;
