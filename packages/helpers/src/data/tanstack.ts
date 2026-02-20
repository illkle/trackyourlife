import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
import { toPowerSyncTable } from "@powersync/drizzle-driver";
import { PowersyncDrizzleSchema } from "@tyl/db/client/schema-powersync";
import { AbstractPowerSyncDatabase } from "@powersync/common";
import { createCollection } from "@tanstack/react-db";
import z from "zod";

export const trackableTable = toPowerSyncTable(PowersyncDrizzleSchema.trackable, {
  viewName: "TYL_trackable",
});

export const trackableRecordTable = toPowerSyncTable(PowersyncDrizzleSchema.trackableRecord, {
  viewName: "TYL_trackableRecord",
});

export const trackableFlagsTable = toPowerSyncTable(PowersyncDrizzleSchema.trackableFlags, {
  viewName: "TYL_trackableFlags",
});

export const trackableGroupTable = toPowerSyncTable(PowersyncDrizzleSchema.trackableGroup, {
  viewName: "TYL_trackableGroup",
});

export const userFlagsTable = toPowerSyncTable(PowersyncDrizzleSchema.userFlags, {
  viewName: "TYL_userFlags",
});

export const createTanstackDB = (db: AbstractPowerSyncDatabase) => {
  return {
    trackable: createCollection(
      powerSyncCollectionOptions({
        database: db,
        table: trackableTable,
      }),
    ),
    trackableRecord: createCollection(
      powerSyncCollectionOptions({
        database: db,
        table: trackableRecordTable,
        schema: z.object({
          id: z.string(),
          user_id: z.string(),
          timestamp: z.string(),
          time_bucket: z.string().nullable().default(null),
          trackable_id: z.string(),
          value: z.string(),
          external_key: z.string().nullable().default(null),
          updated_at: z.number().nullable().default(null),
        }),
        onDeserializationError: () => console.log("des"),
      }),
    ),
    trackableFlags: createCollection(
      powerSyncCollectionOptions({
        database: db,
        table: trackableFlagsTable,
      }),
    ),
    trackableGroup: createCollection(
      powerSyncCollectionOptions({
        database: db,
        table: trackableGroupTable,
      }),
    ),
    userFlags: createCollection(
      powerSyncCollectionOptions({
        database: db,
        table: userFlagsTable,
      }),
    ),
  };
};

export type TanstackDBType = ReturnType<typeof createTanstackDB>;
