/*
import { createCollection } from "@tanstack/react-db";
import { powerSyncCollectionOptions } from "@tanstack/powersync-db-collection";
import { toPowerSyncTable } from "@powersync/drizzle-driver";
import { PowersyncDrizzleSchema } from "./schema-powersync";
import { AbstractPowerSyncDatabase } from "@powersync/common";


export const createTrackableCollection = (db: AbstractPowerSyncDatabase) => {
  return createCollection(
    powerSyncCollectionOptions({
      database: db,
      table: toPowerSyncTable(PowersyncDrizzleSchema.trackable, {
        viewName: "trackable",
      }),
    }),
  );
};

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

*/
