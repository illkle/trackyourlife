/**
 * PowerSync Provider for web application.
 * Sets up PowerSync database, Drizzle wrapper, and provides user context.
 */

import type { ReactNode } from "react";
import { useLayoutEffect, useState } from "react";
import { wrapPowerSyncWithDrizzle } from "@powersync/drizzle-driver";
import { PowerSyncContext } from "@powersync/react";
import {
  PowerSyncBackendConnector,
  PowerSyncDatabase,
  WASQLiteOpenFactory,
  WASQLiteVFS,
} from "@powersync/web";

import { PowersyncDrizzleContext } from "@tyl/db/client/context";
import {
  PowersyncDrizzleSchema,
  PowersyncSchema,
  TPowersyncDrizzleDB,
} from "@tyl/db/client/schema-powersync";

import { useSessionAuthed } from "~/utils/useSessionInfo";
import { Connector } from "./connector";

// Create PowerSync database instance
const createPowersyncWeb = () => {
  const powersyncDb = new PowerSyncDatabase({
    schema: PowersyncSchema,
    database: new WASQLiteOpenFactory({
      dbFilename: "powersync.db",
      vfs: WASQLiteVFS.OPFSCoopSyncVFS,
      flags: {
        enableMultiTabs: typeof SharedWorker !== "undefined",
      },
    }),
    flags: {
      enableMultiTabs: typeof SharedWorker !== "undefined",
    },
  });

  const drizzleDb = wrapPowerSyncWithDrizzle(powersyncDb, {
    schema: PowersyncDrizzleSchema,
  });

  return { powersyncDb, drizzleDb };
};

interface PowerSyncProviderProps {
  children: ReactNode;
  userId: string;
}

export const PowerSyncProvider = ({ children, userId }: PowerSyncProviderProps) => {
  const [databases, setDatabases] = useState<{
    powersyncDb: PowerSyncDatabase;
    drizzleDb: TPowersyncDrizzleDB;
  } | null>(null);

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
    const { powersyncDb, drizzleDb } = createPowersyncWeb();
    const connector = new Connector();
    asyncConnect(powersyncDb, connector);
    setDatabases({ powersyncDb, drizzleDb });

    return () => {
      void powersyncDb.disconnect();
    };
  }, [userId]);

  const { sessionInfo } = useSessionAuthed();

  if (!databases) {
    return null;
  }

  return (
    <PowerSyncContext.Provider value={databases.powersyncDb}>
      <PowersyncDrizzleContext.Provider
        value={{ db: databases.drizzleDb, userID: sessionInfo.user.id }}
      >
        {children}
      </PowersyncDrizzleContext.Provider>
    </PowerSyncContext.Provider>
  );
};
