/* eslint-disable @typescript-eslint/unbound-method */
import type { ExpressionBuilder, Row } from "@rocicorp/zero";
import {
  column,
  createSchema,
  createTableSchema,
  definePermissions,
} from "@rocicorp/zero";

const { json } = column;

const TYL_trackableRecord = createTableSchema({
  tableName: "TYL_trackableRecord",
  columns: {
    recordId: { type: "string" },
    date: { type: "number" },
    trackableId: { type: "string" },
    value: { type: "string" },
    user_id: { type: "string" },
    createdAt: { type: "number", optional: true },
  },
  primaryKey: "recordId",
});

const TYL_trackableGroup = createTableSchema({
  tableName: "TYL_trackableGroup",
  columns: {
    trackableId: { type: "string" },
    group: { type: "string" },
    user_id: { type: "string" },
  },
  primaryKey: ["trackableId", "group"],
});

const TYL_trackableFlags = createTableSchema({
  tableName: "TYL_trackableFlags",
  columns: {
    trackableId: { type: "string" },
    key: { type: "string" },
    value: { type: "json", optional: true },
  },
  primaryKey: ["trackableId", "key"],
});

const TYL_userFlags = createTableSchema({
  tableName: "TYL_userFlags",
  columns: {
    userId: { type: "string" },
    key: { type: "string" },
    value: { type: "json", optional: true },
  },
  primaryKey: ["userId", "key"],
});

const TYL_trackable = createTableSchema({
  tableName: "TYL_trackable",
  columns: {
    user_id: { type: "string" },
    id: { type: "string" },
    name: { type: "string" },
    type: column.enumeration<"boolean" | "number" | "text" | "tags" | "logs">(
      false,
    ),
  },
  primaryKey: "id",
  relationships: {
    trackableRecord: {
      sourceField: "id",
      destSchema: TYL_trackableRecord,
      destField: "trackableId",
    },
    trackableGroup: {
      sourceField: "id",
      destSchema: TYL_trackableGroup,
      destField: "trackableId",
    },
    trackableFlags: {
      sourceField: "id",
      destSchema: TYL_trackableFlags,
      destField: "trackableId",
    },
  },
});

export const schema = createSchema({
  version: 2,
  tables: {
    TYL_trackable,
    TYL_trackableRecord,
    TYL_trackableGroup,
    TYL_trackableFlags,
    TYL_userFlags,
  },
});

export type Schema = typeof schema;

interface AuthData {
  sub: string;
}

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
  const allowIfOwnerTrackable = (
    authData: AuthData,
    { cmp }: ExpressionBuilder<typeof TYL_trackable>,
  ) => cmp("user_id", "=", authData.sub);

  const allowIfOwnerTrackableRecord = (
    authData: AuthData,
    { cmp }: ExpressionBuilder<typeof TYL_trackableRecord>,
  ) => cmp("user_id", "=", authData.sub);

  const allowIfOwnerTrackableGroup = (
    authData: AuthData,
    { cmp }: ExpressionBuilder<typeof TYL_trackableGroup>,
  ) => cmp("user_id", "=", authData.sub);

  const allowIfOwnerUserFlags = (
    authData: AuthData,
    { cmp }: ExpressionBuilder<typeof TYL_userFlags>,
  ) => cmp("userId", "=", authData.sub);

  const allowIfOwnerTrackableFlags = (
    authData: AuthData,
    { cmp }: ExpressionBuilder<typeof TYL_trackableFlags>,
  ) => cmp("trackableId", "=", authData.sub);

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
