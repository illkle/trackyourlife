/**
 * Trackable flags React hooks
 */

import { useMemo } from "react";
import { toCompilableQuery } from "@powersync/drizzle-driver";
import { useQuery } from "@powersync/react";
import { eq } from "drizzle-orm";

import { trackableFlags } from "../../schema-powersync";
import { usePowersyncDrizzle } from "../context";

/** Hook to get all trackable flags */
export const useAllTrackableFlags = () => {
  const db = usePowersyncDrizzle();
  const query = useMemo(
    () => toCompilableQuery(db.query.trackableFlags.findMany()),
    [db],
  );
  return useQuery(query);
};

/** Hook to get trackable flags, optionally filtered by trackable IDs */
export const useTrackableFlags = (trackableIds?: string[]) => {
  const result = useAllTrackableFlags();

  const filteredData = useMemo(() => {
    if (!result.data) return [];
    if (!trackableIds || trackableIds.length === 0) return result.data;
    const idSet = new Set(trackableIds);
    return result.data.filter((f) => idSet.has(f.trackable_id));
  }, [result.data, trackableIds]);

  return {
    ...result,
    data: filteredData,
  };
};

/** Hook to get flags for a single trackable */
export const useFlagsForTrackable = (trackableId: string) => {
  const db = usePowersyncDrizzle();
  const query = useMemo(
    () =>
      toCompilableQuery(
        db.query.trackableFlags.findMany({
          where: eq(trackableFlags.trackable_id, trackableId),
        }),
      ),
    [db, trackableId],
  );
  return useQuery(query);
};
