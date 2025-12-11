import { Connector } from "@/db/connector";
import { wrapPowerSyncWithDrizzle } from "@powersync/drizzle-driver";
import { OPSqliteOpenFactory } from "@powersync/op-sqlite"; // Add this import
import {
  createBaseLogger,
  LogLevel,
  PowerSyncDatabase,
} from "@powersync/react-native";

import { AppSchema, drizzleSchema } from "./schema";

// Create the factory
const opSqlite = new OPSqliteOpenFactory({
  dbFilename: "powersync.db",
});

export const powersyncDB = new PowerSyncDatabase({
  // For other options see,
  schema: AppSchema,
  // Override the default database
  database: opSqlite,
});

export const db = wrapPowerSyncWithDrizzle(powersyncDB, {
  schema: drizzleSchema,
});

export const setupPowerSync = async () => {
  // Uses the backend connector that will be created in the next section
  const connector = new Connector();
  powersyncDB.connect(connector);
};

const logger = createBaseLogger();

logger.useDefaults();
logger.setLevel(LogLevel.DEBUG);
