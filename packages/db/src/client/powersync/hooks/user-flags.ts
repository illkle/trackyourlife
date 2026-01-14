/**
 * User flags React hooks
 */

import { useMemo } from "react";
import { toCompilableQuery } from "@powersync/drizzle-driver";
import { useQuery } from "@powersync/react";

import { usePowersyncDrizzle } from "../context";

/** Hook to get all user flags */
export const useUserFlags = () => {
  const db = usePowersyncDrizzle();
  const query = useMemo(
    () => toCompilableQuery(db.query.userFlags.findMany()),
    [db],
  );
  return useQuery(query);
};
