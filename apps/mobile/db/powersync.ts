import "react-native-random-uuid"; // required for tanstack db
import { Connector } from "@/db/connector";
import { AuthClient } from "@/lib/authClient";
import { wrapPowerSyncWithDrizzle } from "@powersync/drizzle-driver";
import { OPSqliteOpenFactory } from "@powersync/op-sqlite"; // Add this import
import { createBaseLogger, LogLevel, PowerSyncDatabase } from "@powersync/react-native";
import { PowerSyncTransactor } from "@tanstack/powersync-db-collection";

import { PowersyncDrizzleSchema, PowersyncSchema } from "@tyl/db/client/schema-powersync";
import { createTanstackDB } from "@tyl/helpers/data/tanstack";

const opSqlite = new OPSqliteOpenFactory({
  dbFilename: "powersync.db",
});

export const powersyncDB = new PowerSyncDatabase({
  schema: PowersyncSchema,
  database: opSqlite,
});

export const db = wrapPowerSyncWithDrizzle(powersyncDB, {
  schema: PowersyncDrizzleSchema,
});

export const dbT = createTanstackDB(powersyncDB);

export const transactor = new PowerSyncTransactor({ database: powersyncDB });

type PowerSyncConnectionParams = {
  powersyncURL: string;
  serverURL: string;
  authClient: AuthClient;
  userID: string;
  sessionToken: string;
};

let activeConnectionKey: string | null = null;
let isConnecting = false;
let pendingConnection: PowerSyncConnectionParams | null = null;

const createConnectionKey = ({
  powersyncURL,
  serverURL,
  userID,
  sessionToken,
}: PowerSyncConnectionParams) => {
  return `${powersyncURL}|${serverURL}|${userID}|${sessionToken}`;
};

export const ensurePowerSyncConnected = async (params: PowerSyncConnectionParams) => {
  const nextKey = createConnectionKey(params);

  if (activeConnectionKey === nextKey) {
    return;
  }

  if (isConnecting) {
    pendingConnection = params;
    return;
  }

  isConnecting = true;

  try {
    await powersyncDB.disconnect();

    const connector = new Connector({
      powersyncURL: params.powersyncURL,
      serverURL: params.serverURL,
      authClient: params.authClient,
    });

    await powersyncDB.connect(connector);
    activeConnectionKey = nextKey;
  } finally {
    isConnecting = false;

    if (pendingConnection) {
      const nextPending = pendingConnection;
      pendingConnection = null;
      await ensurePowerSyncConnected(nextPending);
    }
  }
};

export const disconnectPowerSync = async () => {
  pendingConnection = null;
  activeConnectionKey = null;
  await powersyncDB.disconnect();
};

export const resetPowerSync = async () => {
  pendingConnection = null;
  activeConnectionKey = null;
  await powersyncDB.disconnectAndClear();
};

const logger = createBaseLogger();

logger.useDefaults();
logger.setLevel(LogLevel.DEBUG);
