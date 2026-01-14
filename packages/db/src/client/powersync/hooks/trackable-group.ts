/**
 * Trackable group React hooks
 */

import { useCallback, useMemo } from "react";
import { toCompilableQuery } from "@powersync/drizzle-driver";
import { useQuery } from "@powersync/react";
import { and, eq } from "drizzle-orm";

import { trackableGroup } from "../../schema-powersync";
import { usePowersyncDrizzle } from "../context";
import { deleteGroup, insertGroup } from "../trackable-group";

/** Hook to get all trackable groups */
export const useTrackableGroups = () => {
  const db = usePowersyncDrizzle();
  const query = useMemo(
    () => toCompilableQuery(db.query.trackableGroup.findMany()),
    [db],
  );
  return useQuery(query);
};

/** Hook to get groups for a specific trackable */
export const useGroupsForTrackable = (trackableId: string) => {
  const db = usePowersyncDrizzle();
  const query = useMemo(
    () =>
      toCompilableQuery(
        db.query.trackableGroup.findMany({
          where: eq(trackableGroup.trackable_id, trackableId),
        }),
      ),
    [db, trackableId],
  );
  return useQuery(query);
};

/** Hook to get trackables in a specific group */
export const useGroupList = (group: string) => {
  const db = usePowersyncDrizzle();
  const query = useMemo(
    () =>
      toCompilableQuery(
        db.query.trackableGroup.findMany({
          where: eq(trackableGroup.group, group),
        }),
      ),
    [db, group],
  );
  return useQuery(query);
};

/** Hook to get a Set of trackable IDs in a specific group */
export const useGroupSet = (group: string) => {
  const result = useGroupList(group);
  const set = useMemo(
    () => new Set(result.data?.map((g) => g.trackable_id) ?? []),
    [result.data],
  );
  return { ...result, data: set };
};

/** Hook to check if a trackable is in a specific group */
export const useTrackableInGroup = (trackableId: string, group: string) => {
  const db = usePowersyncDrizzle();
  const query = useMemo(
    () =>
      toCompilableQuery(
        db.query.trackableGroup.findMany({
          where: and(
            eq(trackableGroup.trackable_id, trackableId),
            eq(trackableGroup.group, group),
          ),
        }),
      ),
    [db, trackableId, group],
  );
  const result = useQuery(query);
  return {
    ...result,
    data: (result.data?.length ?? 0) > 0,
  };
};

/** Hook to get a group toggle handler */
export const useGroupToggleHandler = (
  trackableId: string,
  group: string,
  userId: string,
) => {
  const db = usePowersyncDrizzle();
  const { data: isInGroup } = useTrackableInGroup(trackableId, group);

  return useCallback(async () => {
    if (isInGroup) {
      await deleteGroup(db, { user_id: userId, trackable_id: trackableId, group });
    } else {
      await insertGroup(db, { user_id: userId, trackable_id: trackableId, group });
    }
  }, [db, trackableId, group, isInGroup, userId]);
};
