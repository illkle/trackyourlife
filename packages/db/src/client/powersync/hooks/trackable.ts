/**
 * Trackable React hooks
 */

import { useMemo } from "react";
import { toCompilableQuery } from "@powersync/drizzle-driver";
import { useQuery } from "@powersync/react";
import { and, asc, eq, gte, lte } from "drizzle-orm";

import { trackable, trackableGroup, trackableRecord } from "../../schema-powersync";
import { usePowersyncDrizzle } from "../context";
import type { TrackableGroupRow, TrackableRecordRow, TrackableWithData, TrackableWithGroups } from "../types";

/** Hook to get all trackables */
export const useTrackablesList = () => {
  const db = usePowersyncDrizzle();
  const query = useMemo(
    () =>
      toCompilableQuery(
        db.query.trackable.findMany({
          orderBy: asc(trackable.name),
        }),
      ),
    [db],
  );
  return useQuery(query);
};

/** Hook to get a single trackable by ID */
export const useTrackable = (id: string) => {
  const db = usePowersyncDrizzle();
  const query = useMemo(
    () =>
      toCompilableQuery(
        db.query.trackable.findMany({
          where: eq(trackable.id, id),
        }),
      ),
    [db, id],
  );
  const result = useQuery(query);
  return {
    ...result,
    data: result.data?.[0] ?? null,
  };
};

/** Hook to get all trackable groups (internal use) */
const useAllGroups = () => {
  const db = usePowersyncDrizzle();
  const query = useMemo(
    () => toCompilableQuery(db.query.trackableGroup.findMany()),
    [db],
  );
  return useQuery(query);
};

/** Hook to get all records in a date range (internal use) */
const useAllRecordsInRange = (startDate: string, endDate: string) => {
  const db = usePowersyncDrizzle();
  const query = useMemo(
    () =>
      toCompilableQuery(
        db.query.trackableRecord.findMany({
          where: and(
            gte(trackableRecord.date, startDate),
            lte(trackableRecord.date, endDate),
          ),
          orderBy: [asc(trackableRecord.date), asc(trackableRecord.created_at)],
        }),
      ),
    [db, startDate, endDate],
  );
  return useQuery(query);
};

/** Hook to get trackables with their groups */
export const useTrackablesWithGroups = (): {
  data: TrackableWithGroups[];
  isLoading: boolean;
  error: Error | undefined;
} => {
  const trackablesResult = useTrackablesList();
  const groupsResult = useAllGroups();

  const data = useMemo(() => {
    if (!trackablesResult.data || !groupsResult.data) return [];

    const groupsByTrackable = new Map<string, TrackableGroupRow[]>();
    for (const group of groupsResult.data) {
      const existing = groupsByTrackable.get(group.trackable_id) ?? [];
      existing.push(group);
      groupsByTrackable.set(group.trackable_id, existing);
    }

    return trackablesResult.data.map((t) => ({
      ...t,
      trackableGroup: groupsByTrackable.get(t.id) ?? [],
    }));
  }, [trackablesResult.data, groupsResult.data]);

  return {
    data,
    isLoading: trackablesResult.isLoading || groupsResult.isLoading,
    error: trackablesResult.error ?? groupsResult.error,
  };
};

/** Hook to get trackables with groups and records in a date range */
export const useTrackablesWithData = (
  startDate: string,
  endDate: string,
): {
  data: TrackableWithData[];
  isLoading: boolean;
  error: Error | undefined;
} => {
  const trackablesWithGroups = useTrackablesWithGroups();
  const recordsResult = useAllRecordsInRange(startDate, endDate);

  const data = useMemo(() => {
    if (!trackablesWithGroups.data || !recordsResult.data) return [];

    const recordsByTrackable = new Map<string, TrackableRecordRow[]>();
    for (const record of recordsResult.data) {
      const existing = recordsByTrackable.get(record.trackable_id) ?? [];
      existing.push(record);
      recordsByTrackable.set(record.trackable_id, existing);
    }

    return trackablesWithGroups.data.map((t) => ({
      ...t,
      trackableRecord: recordsByTrackable.get(t.id) ?? [],
    }));
  }, [trackablesWithGroups.data, recordsResult.data]);

  return {
    data,
    isLoading: trackablesWithGroups.isLoading || recordsResult.isLoading,
    error: trackablesWithGroups.error ?? recordsResult.error,
  };
};

/** Hook to get a single trackable with its groups */
export const useTrackableWithGroups = (
  id: string,
): {
  data: TrackableWithGroups | null;
  isLoading: boolean;
  error: Error | undefined;
} => {
  const trackableResult = useTrackable(id);
  const db = usePowersyncDrizzle();

  const groupsQuery = useMemo(
    () =>
      toCompilableQuery(
        db.query.trackableGroup.findMany({
          where: eq(trackableGroup.trackable_id, id),
        }),
      ),
    [db, id],
  );
  const groupsResult = useQuery(groupsQuery);

  const data = useMemo(() => {
    if (!trackableResult.data) return null;
    return {
      ...trackableResult.data,
      trackableGroup: groupsResult.data ?? [],
    };
  }, [trackableResult.data, groupsResult.data]);

  return {
    data,
    isLoading: trackableResult.isLoading || groupsResult.isLoading,
    error: trackableResult.error ?? groupsResult.error,
  };
};
