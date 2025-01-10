/* eslint-disable @typescript-eslint/unbound-method */
import type { ExpressionBuilder } from "@rocicorp/zero";
import {
  column,
  createSchema,
  createTableSchema,
  definePermissions,
} from "@rocicorp/zero";

import type { ITrackableSettings } from "@tyl/db/jsonValidators";

const { json } = column;

const TYL_trackableRecord = createTableSchema({
  tableName: "TYL_trackableRecord",
  columns: {
    recordId: { type: "string" },
    date: { type: "number" },
    trackableId: { type: "string" },
    value: { type: "string" },
    user_id: { type: "string" },
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

const TYL_trackable = createTableSchema({
  tableName: "TYL_trackable",
  columns: {
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
    trackableGroup: {
      sourceField: "id",
      destSchema: TYL_trackableGroup,
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
