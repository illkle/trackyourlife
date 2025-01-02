import {
  ANYONE_CAN,
  column,
  createSchema,
  createTableSchema,
  definePermissions,
  ExpressionBuilder,
} from "@rocicorp/zero";

import { ITrackableSettings } from "@tyl/db/jsonValidators";

const { json } = column;

const TYL_trackableRecord = createTableSchema({
  tableName: "TYL_trackableRecord",
  columns: {
    date: { type: "number" },
    trackableId: { type: "string" },
    value: { type: "string" },
    user_id: { type: "string" },
  },
  primaryKey: ["trackableId", "date"],
});

const TYL_trackable = createTableSchema({
  tableName: "TYL_trackable",
  columns: {
    is_deleted: { type: "boolean" },
    user_id: { type: "string" },
    id: { type: "string" },
    name: { type: "string" },
    type: column.enumeration<"boolean" | "range" | "number">(false),
    attached_note: { type: "string" },
    settings: json<ITrackableSettings>(),
  },
  primaryKey: "id",
  relationships: {
    trackableRecord: {
      sourceField: "id",
      destSchema: TYL_trackableRecord,
      destField: "trackableId",
    },
  },
});

const TYL_trackableGroup = createTableSchema({
  tableName: "TYL_trackableGroup",
  columns: {
    trackableId: { type: "string" },
    group: { type: "string" },
    user_id: { type: "string" },
  },
  primaryKey: ["trackableId", "group"],
  relationships: {
    trackable: {
      sourceField: "trackableId",
      destSchema: TYL_trackable,
      destField: "id",
    },
  },
});

export const schema = createSchema({
  version: 1,
  tables: {
    TYL_trackable,
    TYL_trackableRecord,
    TYL_trackableGroup,
  },
});

export type Schema = typeof schema;

type AuthData = {
  sub: string;
};

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
  };
});

export const permissions2 = definePermissions<AuthData, Schema>(schema, () => {
  return {
    TYL_trackableRecord: {
      row: {
        // anyone can insert issues
        insert: ANYONE_CAN,
        // nobody can delete issues
        delete: ANYONE_CAN,
      },
    },
  };
});