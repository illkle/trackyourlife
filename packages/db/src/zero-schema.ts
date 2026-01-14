/* eslint-disable @typescript-eslint/unbound-method */
import type { Row } from "@rocicorp/zero";
import {
  createBuilder,
  createSchema,
  json,
  number,
  relationships,
  string,
  table,
} from "@rocicorp/zero";

/*
  When making any changes here make sure to run `pnpm build:zero-schema` before committing.
*/

const TYL_trackableRecord = table("TYL_trackableRecord")
  .columns({
    id: string(),
    date: number(),
    trackable_id: string(),
    value: string(),
    user_id: string(),
    created_at: number().optional(),
    updated_at: number().optional(),
  })
  .primaryKey("id");

const TYL_trackableGroup = table("TYL_trackableGroup")
  .columns({
    trackable_id: string(),
    group: string(),
    user_id: string(),
  })
  .primaryKey("trackable_id", "group");

const TYL_trackableFlags = table("TYL_trackableFlags")
  .columns({
    user_id: string(),
    trackable_id: string(),
    key: string(),
    value: json().optional(),
  })
  .primaryKey("user_id", "trackable_id", "key");

const TYL_userFlags = table("TYL_userFlags")
  .columns({
    user_id: string(),
    key: string(),
    value: json().optional(),
  })
  .primaryKey("user_id", "key");

const TYL_trackable = table("TYL_trackable")
  .columns({
    user_id: string(),
    id: string(),
    name: string(),
    type: string<"boolean" | "number" | "text">(),
  })
  .primaryKey("id");

const trackableRelationships = relationships(TYL_trackable, ({ many }) => ({
  trackableGroup: many({
    sourceField: ["id"],
    destSchema: TYL_trackableGroup,
    destField: ["trackable_id"],
  }),
  trackableRecord: many({
    sourceField: ["id"],
    destSchema: TYL_trackableRecord,
    destField: ["trackable_id"],
  }),
  trackableFlag: many({
    sourceField: ["id"],
    destSchema: TYL_trackableFlags,
    destField: ["trackable_id"],
  }),
}));

export const schema = createSchema({
  tables: [
    TYL_trackable,
    TYL_trackableRecord,
    TYL_trackableGroup,
    TYL_trackableFlags,
    TYL_userFlags,
  ],

  relationships: [trackableRelationships],
});

export type Schema = typeof schema;

export type ITrackableZero = Row<Schema["tables"]["TYL_trackable"]>;

export type ITrackableFlagsZero = Row<Schema["tables"]["TYL_trackableFlags"]>;

export type ITrackableRecordZero = Row<Schema["tables"]["TYL_trackableRecord"]>;

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type ITrackableZeroInsert = Mutable<ITrackableZero>;

export const zql = createBuilder(schema);

export type ZeroContext = {
  userID: string;
};

declare module "@rocicorp/zero" {
  interface DefaultTypes {
    context: ZeroContext;
    schema: Schema;
  }
}
