/**
 * PowerSync React context for providing the Drizzle database instance.
 */

import { createContext, useContext } from "react";

import type { TPowersyncDrizzleDB } from "./schema-powersync";

export const PowersyncDrizzleContext = createContext<{
  db: TPowersyncDrizzleDB;
  userID: string;
} | null>(null);

export const usePowersyncDrizzle = () => {
  const data = useContext(PowersyncDrizzleContext);
  if (!data) {
    throw new Error("usePowersyncDrizzle must be used within PowersyncDrizzleContext.Provider");
  }

  return data;
};
