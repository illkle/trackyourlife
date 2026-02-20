import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
import { toPowerSyncTable } from "@powersync/drizzle-driver";
import { PowersyncDrizzleSchema } from "./schema-powersync";
import { AbstractPowerSyncDatabase } from "@powersync/common";
import { createCollection, useLiveQuery } from "@tanstack/react-db";

export const trackableTable = toPowerSyncTable(PowersyncDrizzleSchema.trackable, {
  viewName: "trackable",
});

export const trackableRecordTable = toPowerSyncTable(PowersyncDrizzleSchema.trackableRecord, {
  viewName: "trackableRecord",
});

export const trackableFlagsTable = toPowerSyncTable(PowersyncDrizzleSchema.trackableFlags, {
  viewName: "trackableFlags",
});

export const trackableGroupTable = toPowerSyncTable(PowersyncDrizzleSchema.trackableGroup, {
  viewName: "trackableGroup",
});

export const userFlagsTable = toPowerSyncTable(PowersyncDrizzleSchema.userFlags, {
  viewName: "userFlags",
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
