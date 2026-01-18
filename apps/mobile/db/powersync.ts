import { Connector } from "@/db/connector";
import { wrapPowerSyncWithDrizzle } from "@powersync/drizzle-driver";
import { OPSqliteOpenFactory } from "@powersync/op-sqlite"; // Add this import
import { createBaseLogger, LogLevel, PowerSyncDatabase } from "@powersync/react-native";

import { PowersyncDrizzleSchema, PowersyncSchema } from "@tyl/db/client/schema-powersync";

// Create the factory
const opSqlite = new OPSqliteOpenFactory({
  dbFilename: "powersync.db",
});

export const powersyncDB = new PowerSyncDatabase({
  // For other options see,
  schema: PowersyncSchema,
  // Override the default database
  database: opSqlite,
});

export const db = wrapPowerSyncWithDrizzle(powersyncDB, {
  schema: PowersyncDrizzleSchema,
});

export const setupPowerSync = async () => {
  // Uses the backend connector that will be created in the next section
  const connector = new Connector();
  powersyncDB.connect(connector);
};

const logger = createBaseLogger();

logger.useDefaults();
logger.setLevel(LogLevel.DEBUG);
