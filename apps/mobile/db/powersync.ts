import { Connector } from "@/db/connector";
import { AuthClient } from "@/lib/authClient";
import { wrapPowerSyncWithDrizzle } from "@powersync/drizzle-driver";
import { OPSqliteOpenFactory } from "@powersync/op-sqlite"; // Add this import
import { createBaseLogger, LogLevel, PowerSyncDatabase } from "@powersync/react-native";

import { PowersyncDrizzleSchema, PowersyncSchema } from "@tyl/db/client/schema-powersync";
import { createTanstackDB } from "@tyl/db/client/tanstack";

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

export const connectPowerSync = async ({
  powersyncURL,
  serverURL,
  authClient,
  withClear = false,
}: {
  powersyncURL: string;
  serverURL: string;
  authClient: AuthClient;
  withClear?: boolean;
}) => {
  if (withClear) {
    await powersyncDB.disconnectAndClear();
  } else {
    await powersyncDB.disconnect();
  }
  const connector = new Connector({ powersyncURL, serverURL, authClient });
  powersyncDB.connect(connector);
};

const logger = createBaseLogger();

logger.useDefaults();
logger.setLevel(LogLevel.DEBUG);
