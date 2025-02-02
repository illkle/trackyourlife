import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
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

const pgTable = pgTableCreator((name) => `TYL_${name}`);

/**
 * AUTH https://www.better-auth.com/docs/installation
 * npx @better-auth/cli generate --config ./apps/server/app/utils/auth.ts
 * Copy output here manually and remove prefixes, they are set by pgtable
 */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
});

// Account is credentials\oauth data. All user settings and data should reference user table, not this one.
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

export const jwks = pgTable("jwks", {
  id: text("id").primaryKey(),
  publicKey: text("publicKey").notNull(),
  privateKey: text("privateKey").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

/*
 * Tables related to user.
 */
export const userFlags = pgTable(
  "userFlags",
  {
    userId: text("userId")
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
    user_id: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    type: trackableTypeEnum("type").notNull(),
  },
  (t) => [
    uniqueIndex("user_id_idx").on(t.user_id, t.id),
    index("user_id_name_idx").on(t.user_id, t.name),
  ],
);

/*
 * Settings and additional information about trackable.
 */
export const trackableFlags = pgTable(
  "trackableFlags",
  {
    user_id: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    trackableId: uuid("trackableId")
      .notNull()
      .references(() => trackable.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    value: json("value").default({}),
  },
  (t) => [primaryKey({ columns: [t.user_id, t.trackableId, t.key] })],
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
    recordId: uuid("recordId").defaultRandom().primaryKey(),
    user_id: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    trackableId: uuid("trackableId")
      .notNull()
      .references(() => trackable.id, { onDelete: "cascade" }),
    date: timestamp("date").notNull(),
    value: text("value").notNull(),
    /*
      Only for trackables that allow multiple records per day, used to sort records.
      Since this application is local first and insert to PG can differ from actual creation date, value is set by the client.
      Stored as unix timestamp to avoid timezone issues and simplify sorting.
    */
    createdAt: bigint("createdAt", { mode: "number" }),
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
    index("user_date_idx").on(t.user_id, t.date),
  ],
);

export const trackableRecordAttributes = pgTable(
  "trackableRecordAttributes",
  {
    user_id: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    trackableId: uuid("trackableId")
      .notNull()
      .references(() => trackable.id, { onDelete: "cascade" }),
    recordId: uuid("recordId")
      .notNull()
      .references(() => trackableRecord.recordId, { onDelete: "cascade" }),
    key: text("key").notNull(),
    value: text("value"),
  },
  (t) => [
    primaryKey({ columns: [t.user_id, t.trackableId, t.recordId, t.key] }),
  ],
);

export const recordRelations = relations(trackableRecord, ({ one }) => ({
  trackableId: one(trackable, {
    fields: [trackableRecord.trackableId],
    references: [trackable.id],
  }),
  userId: one(user, {
    fields: [trackableRecord.user_id],
    references: [user.id],
  }),
}));

export const trackableGroup = pgTable(
  "trackableGroup",
  {
    trackableId: uuid("trackableId")
      .notNull()
      .references(() => trackable.id, { onDelete: "cascade" }),
    group: text("group").notNull(),
    user_id: text("user_id")
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
    fields: [trackableGroup.user_id],
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
