/**
 * PowerSync Provider for web application.
 * Sets up PowerSync database, Drizzle wrapper, and provides user context.
 */

import type { ReactNode } from "react";
import { useLayoutEffect, useState } from "react";
import { wrapPowerSyncWithDrizzle } from "@powersync/drizzle-driver";
import { PowerSyncContext } from "@powersync/react";
import {
  createBaseLogger,
  LogLevel,
  PowerSyncBackendConnector,
  PowerSyncDatabase,
  WASQLiteOpenFactory,
  WASQLiteVFS,
} from "@powersync/web";
import { PowerSyncTransactor } from "@tanstack/powersync-db-collection";

import { PowersyncDrizzleContext, TPowersyncDrizzleContext } from "@tyl/helpers/data/context";
import { PowersyncDrizzleSchema, PowersyncSchema } from "@tyl/db/client/schema-powersync";

import { useAuthAuthed } from "~/utils/useSessionInfo";
import { Connector } from "./connector";
import { createTanstackDB, TanstackDBType } from "@tyl/helpers/data/tanstack";

const logger = createBaseLogger();
logger.useDefaults();
logger.setLevel(LogLevel.DEBUG);

const powersyncDb = new PowerSyncDatabase({
  schema: PowersyncSchema,
  database: new WASQLiteOpenFactory({
    dbFilename: "powersync.db",
    vfs: WASQLiteVFS.OPFSCoopSyncVFS,
    flags: {
      enableMultiTabs: typeof SharedWorker !== "undefined",
    },
    debugMode: true,
  }),
  flags: {
    enableMultiTabs: typeof SharedWorker !== "undefined",
  },
});

const drizzleDb = wrapPowerSyncWithDrizzle(powersyncDb, {
  schema: PowersyncDrizzleSchema,
});

const tanstackDb = createTanstackDB(powersyncDb);

export const PowerSyncProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuthAuthed();

  const [databases, setDatabases] = useState<TPowersyncDrizzleContext>(null);

  const asyncConnect = async (db: PowerSyncDatabase, connector: PowerSyncBackendConnector) => {
    console.log("Connecting to PowerSync");
    try {
      await db.connect(connector);
      console.log("Connected to PowerSync");
    } catch (error) {
      console.error("Error connecting to PowerSync", error);
      throw error;
    }
  };

  useLayoutEffect(() => {
    const connector = new Connector();
    asyncConnect(powersyncDb, connector);

    setDatabases({
      userID: user.id,
      dbS: powersyncDb,
      db: drizzleDb,
      dbT: tanstackDb,
      transactor: new PowerSyncTransactor({ database: powersyncDb }),
    });

    return () => {
      void powersyncDb.disconnect();
    };
  }, [user.id]);

  if (!databases) {
    return null;
  }

  return (
    <PowerSyncContext.Provider value={databases.dbS}>
      <PowersyncDrizzleContext.Provider value={databases}>
        {children}
      </PowersyncDrizzleContext.Provider>
    </PowerSyncContext.Provider>
  );
};
