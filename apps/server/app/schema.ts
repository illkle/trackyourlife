/* eslint-disable @typescript-eslint/unbound-method */
import type { ExpressionBuilder, Row } from "@rocicorp/zero";
import {
  createSchema,
  definePermissions,
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
    recordId: string(),
    date: number(),
    trackableId: string(),
    value: json(),
    user_id: string(),
    createdAt: number().optional(),
  })
  .primaryKey("recordId");

const TYL_trackableGroup = table("TYL_trackableGroup")
  .columns({
    trackableId: string(),
    group: string(),
    user_id: string(),
  })
  .primaryKey("trackableId", "group");

const TYL_trackableFlags = table("TYL_trackableFlags")
  .columns({
    user_id: string(),
    trackableId: string(),
    key: string(),
    value: json().optional(),
  })
  .primaryKey("user_id", "trackableId", "key");

const TYL_userFlags = table("TYL_userFlags")
  .columns({
    userId: string(),
    key: string(),
    value: json().optional(),
  })
  .primaryKey("userId", "key");

const TYL_trackable = table("TYL_trackable")
  .columns({
    user_id: string(),
    id: string(),
    name: string(),
    type: string<"boolean" | "number" | "text" | "tags" | "logs">(),
  })
  .primaryKey("id");

const trackableRelationships = relationships(TYL_trackable, ({ many }) => ({
  trackableGroup: many({
    sourceField: ["id"],
    destSchema: TYL_trackableGroup,
    destField: ["trackableId"],
  }),
  trackableRecord: many({
    sourceField: ["id"],
    destSchema: TYL_trackableRecord,
    destField: ["trackableId"],
  }),
  trackableFlag: many({
    sourceField: ["id"],
    destSchema: TYL_trackableFlags,
    destField: ["trackableId"],
  }),
}));

export const schema = createSchema(2, {
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

interface AuthData {
  sub: string;
}

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
  const allowIfOwnerTrackable = (
    authData: AuthData,
    { cmp }: ExpressionBuilder<Schema, "TYL_trackable">,
  ) => cmp("user_id", "=", authData.sub);

  const allowIfOwnerTrackableRecord = (
    authData: AuthData,
    { cmp }: ExpressionBuilder<Schema, "TYL_trackableRecord">,
  ) => cmp("user_id", "=", authData.sub);

  const allowIfOwnerTrackableGroup = (
    authData: AuthData,
    { cmp }: ExpressionBuilder<Schema, "TYL_trackableGroup">,
  ) => cmp("user_id", "=", authData.sub);

  const allowIfOwnerUserFlags = (
    authData: AuthData,
    { cmp }: ExpressionBuilder<Schema, "TYL_userFlags">,
  ) => cmp("userId", "=", authData.sub);

  const allowIfOwnerTrackableFlags = (
    authData: AuthData,
    { cmp }: ExpressionBuilder<Schema, "TYL_trackableFlags">,
  ) => cmp("user_id", "=", authData.sub);

  return {
    TYL_trackableRecord: {
      row: {
        insert: [allowIfOwnerTrackableRecord],
        delete: [allowIfOwnerTrackableRecord],
        select: [allowIfOwnerTrackableRecord],
        preMutation: [allowIfOwnerTrackableRecord],
        postMutation: [allowIfOwnerTrackableRecord],
      },
    },
    TYL_trackable: {
      row: {
        insert: [allowIfOwnerTrackable],
        delete: [allowIfOwnerTrackable],
        select: [allowIfOwnerTrackable],
        preMutation: [allowIfOwnerTrackable],
        postMutation: [allowIfOwnerTrackable],
      },
    },
    TYL_trackableGroup: {
      row: {
        insert: [allowIfOwnerTrackableGroup],
        delete: [allowIfOwnerTrackableGroup],
        select: [allowIfOwnerTrackableGroup],
        preMutation: [allowIfOwnerTrackableGroup],
        postMutation: [allowIfOwnerTrackableGroup],
      },
    },
    TYL_trackableFlags: {
      row: {
        insert: [allowIfOwnerTrackableFlags],
        delete: [allowIfOwnerTrackableFlags],
        select: [allowIfOwnerTrackableFlags],
        preMutation: [allowIfOwnerTrackableFlags],
        postMutation: [allowIfOwnerTrackableFlags],
      },
    },
    TYL_userFlags: {
      row: {
        insert: [allowIfOwnerUserFlags],
        delete: [allowIfOwnerUserFlags],
        select: [allowIfOwnerUserFlags],
        preMutation: [allowIfOwnerUserFlags],
        postMutation: [allowIfOwnerUserFlags],
      },
    },
  };
});

export type ITrackableZero = Row<Schema["tables"]["TYL_trackable"]>;

export type ITrackableFlagsZero = Row<Schema["tables"]["TYL_trackableFlags"]>;

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type ITrackableZeroInsert = Mutable<ITrackableZero>;
