import { Connector } from "@/db/conncector";
import { OPSqliteOpenFactory } from "@powersync/op-sqlite"; // Add this import
import {
  createBaseLogger,
  LogLevel,
  PowerSyncDatabase,
} from "@powersync/react-native";

import { AppSchema } from "./schema";

// Create the factory
const opSqlite = new OPSqliteOpenFactory({
  dbFilename: "powersync.db",
});

export const powersync = new PowerSyncDatabase({
  // For other options see,
  schema: AppSchema,
  // Override the default database
  database: opSqlite,
});

export const setupPowerSync = async () => {
  // Uses the backend connector that will be created in the next section
  const connector = new Connector();
  powersync.connect(connector);
};

const logger = createBaseLogger();

logger.useDefaults();
logger.setLevel(LogLevel.DEBUG);
