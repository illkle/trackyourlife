/**
 * PowerSync React context for providing the Drizzle database instance.
 */

import { createContext, useContext } from "react";

import type { TPowersyncDrizzleDB } from "../schema-powersync";

export const PowersyncDrizzleContext =
  createContext<TPowersyncDrizzleDB | null>(null);

export const usePowersyncDrizzle = (): TPowersyncDrizzleDB => {
  const db = useContext(PowersyncDrizzleContext);
  if (!db) {
    throw new Error(
      "usePowersyncDrizzle must be used within PowersyncDrizzleContext.Provider",
    );
  }
  return db;
};
