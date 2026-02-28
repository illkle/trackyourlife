/**
 * PowerSync React context for providing the Drizzle database instance.
 */

import { createContext, useContext } from "react";
import { PowerSyncTransactor } from "@tanstack/powersync-db-collection";

import type { TPowersyncDrizzleDB } from "@tyl/db/client/schema-powersync";
import { TanstackDBType } from "./tanstack";
import { AbstractPowerSyncDatabase } from "@powersync/common";

export type TPowersyncDrizzleContext = {
  dbS: AbstractPowerSyncDatabase;
  db: TPowersyncDrizzleDB;
  userID: string;
  dbT: TanstackDBType;
  transactor: PowerSyncTransactor;
} | null;

export const PowersyncDrizzleContext = createContext<TPowersyncDrizzleContext>(null);

export const usePowersyncDrizzle = () => {
  const data = useContext(PowersyncDrizzleContext);
  if (!data) {
    throw new Error("usePowersyncDrizzle must be used within PowersyncDrizzleContext.Provider");
  }

  return data;
};
