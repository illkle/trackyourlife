/**
 * PowerSync data hooks for trackables.
 * Replaces the previous Zero-based hooks with PowerSync equivalents.
 */

import { useCallback, useMemo } from "react";
import { toCompilableQuery } from "@powersync/drizzle-driver";
import { useQuery } from "@powersync/react";
import { endOfDay, startOfDay } from "date-fns";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import type {
  TrackableGroupRow,
  TrackableRecordRow,
  TrackableWithData,
  TrackableWithGroups,
} from "@tyl/db/client/powersync/types";
import { usePowersyncDrizzle } from "@tyl/db/client/powersync/context";
import {
  deleteRecord,
  updateRecord,
  upsertRecord,
} from "@tyl/db/client/powersync/trackable-record";
import {
  trackable,
  trackableGroup,
  trackableRecord,
} from "@tyl/db/client/schema-powersync";

import { useUser } from "~/db/powersync-provider";

const generateDateTime = (date: Date) => {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
};

// Re-export types for backwards compatibility
export type TrackableListItem = TrackableWithGroups;

// ============================================================================
// Date conversion utilities
// ============================================================================

/** Convert a Date to ISO string for PowerSync storage (UTC midnight) */
const dateToISOString = (date: Date | number): string => {
  const d = typeof date === "number" ? new Date(date) : date;
  return new Date(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()),
  ).toISOString();
};

// ============================================================================
// Core hooks
// ============================================================================

/** Hook to get the PowerSync Drizzle database instance */
export const useDb = () => {
  return usePowersyncDrizzle();
};

// ============================================================================
// Trackable list hooks
// ============================================================================

/** Hook to get all trackables with groups */
export const useZeroTrackablesList = (): [
  TrackableWithGroups[],
  { type: string },
] => {
  const db = usePowersyncDrizzle();

  const trackablesQuery = useMemo(
    () =>
      toCompilableQuery(
        db.query.trackable.findMany({ orderBy: asc(trackable.name) }),
      ),
    [db],
  );
  const groupsQuery = useMemo(
    () => toCompilableQuery(db.query.trackableGroup.findMany()),
    [db],
  );

  const trackablesResult = useQuery(trackablesQuery);
  const groupsResult = useQuery(groupsQuery);

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

  const type =
    trackablesResult.isLoading || groupsResult.isLoading
      ? "unknown"
      : "complete";

  return [data, { type }];
};

interface TrackableRangeParams {
  firstDay: number;
  lastDay: number;
}

/** Hook to get trackables with records in a date range */
export const useZeroTrackableListWithData = (
  params: TrackableRangeParams,
): [TrackableWithData[], { type: string }] => {
  const db = usePowersyncDrizzle();
  const startDate = dateToISOString(startOfDay(params.firstDay));
  const endDate = dateToISOString(endOfDay(params.lastDay));

  const trackablesQuery = useMemo(
    () =>
      toCompilableQuery(
        db.query.trackable.findMany({ orderBy: asc(trackable.name) }),
      ),
    [db],
  );
  const groupsQuery = useMemo(
    () => toCompilableQuery(db.query.trackableGroup.findMany()),
    [db],
  );
  const recordsQuery = useMemo(
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

  const trackablesResult = useQuery(trackablesQuery);
  const groupsResult = useQuery(groupsQuery);
  const recordsResult = useQuery(recordsQuery);

  const data = useMemo(() => {
    if (!trackablesResult.data || !groupsResult.data || !recordsResult.data)
      return [];

    const groupsByTrackable = new Map<string, TrackableGroupRow[]>();
    for (const group of groupsResult.data) {
      const existing = groupsByTrackable.get(group.trackable_id) ?? [];
      existing.push(group);
      groupsByTrackable.set(group.trackable_id, existing);
    }

    const recordsByTrackable = new Map<string, TrackableRecordRow[]>();
    for (const record of recordsResult.data) {
      const existing = recordsByTrackable.get(record.trackable_id) ?? [];
      existing.push(record);
      recordsByTrackable.set(record.trackable_id, existing);
    }

    return trackablesResult.data.map((t) => ({
      ...t,
      trackableGroup: groupsByTrackable.get(t.id) ?? [],
      trackableRecord: recordsByTrackable.get(t.id) ?? [],
    }));
  }, [trackablesResult.data, groupsResult.data, recordsResult.data]);

  const type =
    trackablesResult.isLoading ||
    groupsResult.isLoading ||
    recordsResult.isLoading
      ? "unknown"
      : "complete";

  return [data, { type }];
};

// ============================================================================
// Single trackable hooks
// ============================================================================

/** Hook to get a single trackable with groups */
export const useZeroTrackable = ({
  id,
}: {
  id: string;
}): [TrackableWithGroups | undefined, { type: string }] => {
  const db = usePowersyncDrizzle();

  const trackableQuery = useMemo(
    () =>
      toCompilableQuery(
        db.query.trackable.findMany({ where: eq(trackable.id, id) }),
      ),
    [db, id],
  );
  const groupsQuery = useMemo(
    () =>
      toCompilableQuery(
        db.query.trackableGroup.findMany({
          where: eq(trackableGroup.trackable_id, id),
        }),
      ),
    [db, id],
  );

  const trackableResult = useQuery(trackableQuery);
  const groupsResult = useQuery(groupsQuery);

  const data = useMemo(() => {
    const t = trackableResult.data?.[0];
    if (!t) return undefined;
    return {
      ...t,
      trackableGroup: groupsResult.data ?? [],
    };
  }, [trackableResult.data, groupsResult.data]);

  const type =
    trackableResult.isLoading || groupsResult.isLoading
      ? "unknown"
      : "complete";

  return [data, { type }];
};

interface ByIdParams extends TrackableRangeParams {
  id: string;
}

/** Hook to get records for a specific trackable in a date range */
export const useZeroTrackableData = ({ id, firstDay, lastDay }: ByIdParams) => {
  const db = usePowersyncDrizzle();
  const startDate = dateToISOString(startOfDay(firstDay));
  const endDate = dateToISOString(endOfDay(lastDay));

  const query = useMemo(
    () =>
      toCompilableQuery(
        db.query.trackableRecord.findMany({
          where: and(
            eq(trackableRecord.trackable_id, id),
            gte(trackableRecord.date, startDate),
            lte(trackableRecord.date, endDate),
          ),
          orderBy: [asc(trackableRecord.date), asc(trackableRecord.created_at)],
        }),
      ),
    [db, id, startDate, endDate],
  );

  return useQuery(query);
};

// ============================================================================
// Group hooks
// ============================================================================

/** Hook to get all trackables in a group */
export const useZeroGroupList = (group: string) => {
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
  const result = useQuery(query);
  return [
    result.data ?? [],
    { type: result.isLoading ? "unknown" : "complete" },
  ] as const;
};

/** Hook to get a Set of trackable IDs in a group */
export const useZeroGroupSet = (group: string) => {
  const [data] = useZeroGroupList(group);
  return useMemo(
    () => new Set<string>(data.map((f) => f.trackable_id)),
    [data],
  );
};

/** Hook to check if a trackable is in a group */
export const useZeroInGroup = (trackableId: string, group: string) => {
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
  return [
    result.data ?? [],
    { type: result.isLoading ? "unknown" : "complete" },
  ] as const;
};

// ============================================================================
// Day hooks
// ============================================================================

/** Hook to get trackable data for a single day */
export const useTrackableDay = ({
  date,
  trackableId,
}: {
  date: Date;
  trackableId: string;
}) => {
  const db = usePowersyncDrizzle();
  const startDate = dateToISOString(startOfDay(date));
  const endDate = dateToISOString(endOfDay(date));

  const trackableQuery = useMemo(
    () =>
      toCompilableQuery(
        db.query.trackable.findMany({ where: eq(trackable.id, trackableId) }),
      ),
    [db, trackableId],
  );
  const recordsQuery = useMemo(
    () =>
      toCompilableQuery(
        db.query.trackableRecord.findMany({
          where: and(
            eq(trackableRecord.trackable_id, trackableId),
            gte(trackableRecord.date, startDate),
            lte(trackableRecord.date, endDate),
          ),
          orderBy: [
            asc(trackableRecord.date),
            asc(trackableRecord.value),
            asc(trackableRecord.created_at),
          ],
        }),
      ),
    [db, trackableId, startDate, endDate],
  );

  const trackableResult = useQuery(trackableQuery);
  const recordsResult = useQuery(recordsQuery);

  const data = useMemo(() => {
    const t = trackableResult.data?.[0];
    if (!t) return undefined;
    return {
      ...t,
      trackableRecord: recordsResult.data ?? [],
    };
  }, [trackableResult.data, recordsResult.data]);

  return [
    data,
    {
      type:
        trackableResult.isLoading || recordsResult.isLoading
          ? "unknown"
          : "complete",
    },
  ] as const;
};

// ============================================================================
// Mutation hooks
// ============================================================================

/** Hook to get a record update/create handler */
export const useRecordUpdateHandler = ({
  date,
  trackableId,
}: {
  date: Date;
  trackableId: string;
  type?: string;
}) => {
  const db = usePowersyncDrizzle();
  const { userId } = useUser();
  const dateString = dateToISOString(date);

  return useCallback(
    async ({
      value,
      recordId,
      updatedAt,
    }: {
      value: string;
      recordId?: string;
      updatedAt?: number;
    }) => {
      if (recordId) {
        await updateRecord(db, {
          id: recordId,
          value,
          updated_at: updatedAt,
        });
        return recordId;
      } else {
        const rid = uuidv4();
        await upsertRecord(db, {
          id: rid,
          user_id: userId,
          trackable_id: trackableId,
          date: dateString,
          value,
        });
        return rid;
      }
    },
    [db, trackableId, dateString, userId],
  );
};

/** Hook to get a record delete handler */
export const useRecordDeleteHandler = () => {
  const db = usePowersyncDrizzle();
  return useCallback(
    async (recordId: string) => {
      await deleteRecord(db, recordId);
    },
    [db],
  );
};
