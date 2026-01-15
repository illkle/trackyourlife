import { useCallback, useMemo } from "react";
import { toCompilableQuery } from "@powersync/drizzle-driver";
import { useQuery } from "@powersync/react";
import { endOfDay, format, startOfDay } from "date-fns";
import { and, asc, eq, gte, lte, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { usePowersyncDrizzle } from "@tyl/db/client/context";
import {
  DbTrackableInsert,
  trackable,
  trackable_group,
  trackable_record,
} from "@tyl/db/client/schema-powersync";

const dateToSQLiteString = (date: Date | number): string => {
  return format(date, "yyyy-MM-dd HH:mm:ss.SSS");
};

// ============================================================================
// Trackable list hooks
// ============================================================================

/** Hook to get all trackables with groups */
export const useTrackablesList = () => {
  const { db } = usePowersyncDrizzle();

  const trackablesQuery = useMemo(
    () =>
      toCompilableQuery(
        db.query.trackable.findMany({
          orderBy: [
            sql`CASE WHEN EXISTS (
              SELECT 1 FROM TYL_trackableGroup 
              WHERE TYL_trackableGroup.trackable_id = ${trackable.id} 
              AND TYL_trackableGroup."group" = 'favorites'
            ) THEN 0 ELSE 1 END`,
            asc(trackable.name),
          ],
          where: (trackable, { exists, eq, not }) =>
            not(
              exists(
                db
                  .select()
                  .from(trackable_group)
                  .where(
                    and(
                      eq(trackable_group.trackable_id, trackable.id),
                      eq(trackable_group.group, "archived"),
                    ),
                  ),
              ),
            ),

          with: { groups: true },
        }),
      ),
    [db],
  );

  return useQuery(trackablesQuery);
};

interface TrackableRangeParams {
  firstDay: number;
  lastDay: number;
}

/** Hook to get trackables with records in a date range */
export const useTrackableListWithData = (params: TrackableRangeParams) => {
  const { db } = usePowersyncDrizzle();

  const startISO = dateToSQLiteString(params.firstDay);
  const endISO = dateToSQLiteString(params.lastDay);

  const trackablesQuery = useMemo(
    () =>
      toCompilableQuery(
        db.query.trackable.findMany({
          orderBy: [
            sql`CASE WHEN EXISTS (
              SELECT 1 FROM TYL_trackableGroup 
              WHERE TYL_trackableGroup.trackable_id = ${trackable.id} 
              AND TYL_trackableGroup."group" = 'favorites'
            ) THEN 0 ELSE 1 END`,
            asc(trackable.name),
          ],
          where: (trackable, { exists, eq, not }) =>
            not(
              exists(
                db
                  .select()
                  .from(trackable_group)
                  .where(
                    and(
                      eq(trackable_group.trackable_id, trackable.id),
                      eq(trackable_group.group, "archived"),
                    ),
                  ),
              ),
            ),
          with: {
            groups: true,
            data: {
              where: and(
                gte(trackable_record.timestamp, startISO),
                lte(trackable_record.timestamp, endISO),
              ),
              orderBy: [asc(trackable_record.timestamp)],
            },
          },
        }),
      ),
    [db, startISO, endISO],
  );

  return useQuery(trackablesQuery);
};

// ============================================================================
// Single trackable hooks
// ============================================================================

/** Hook to get a single trackable with groups */
export const useTrackable = ({ id }: { id: string }) => {
  const { db } = usePowersyncDrizzle();

  const trackableQuery = useMemo(
    () =>
      toCompilableQuery(
        db.query.trackable.findFirst({
          where: eq(trackable.id, id),
          with: { groups: true },
        }),
      ),
    [db, id],
  );

  return useQuery(trackableQuery);
};

interface ByIdParams extends TrackableRangeParams {
  id: string;
}

/** Hook to get records for a specific trackable in a date range */
export const useTrackableData = ({ id, firstDay, lastDay }: ByIdParams) => {
  const { db } = usePowersyncDrizzle();
  const startDate = dateToSQLiteString(startOfDay(firstDay));
  const endDate = dateToSQLiteString(endOfDay(lastDay));

  const query = useMemo(
    () =>
      toCompilableQuery(
        db.query.trackableRecord.findMany({
          where: and(
            eq(trackable_record.trackable_id, id),
            gte(trackable_record.timestamp, startDate),
            lte(trackable_record.timestamp, endDate),
          ),
          orderBy: [asc(trackable_record.timestamp)],
        }),
      ),
    [db, id, startDate, endDate],
  );

  return useQuery(query);
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
  const { db } = usePowersyncDrizzle();
  const startDate = dateToSQLiteString(startOfDay(date));
  const endDate = dateToSQLiteString(endOfDay(date));

  const q = useMemo(
    () =>
      toCompilableQuery(
        db.query.trackable.findFirst({
          where: eq(trackable.id, trackableId),
          with: {
            data: {
              where: and(
                eq(trackable_record.trackable_id, trackableId),
                gte(trackable_record.timestamp, startDate),
                lte(trackable_record.timestamp, endDate),
              ),
              orderBy: [
                asc(trackable_record.timestamp),
                asc(trackable_record.value),
              ],
            },
          },
        }),
      ),
    [db, trackableId, startDate, endDate],
  );

  return useQuery(q);
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
  const { db, userID } = usePowersyncDrizzle();
  const dateString = dateToSQLiteString(date);

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
        await db
          .update(trackable_record)
          .set({
            updated_at: updatedAt,
            value,
          })
          .where(eq(trackable_record.id, recordId));

        return recordId;
      }

      const id = uuidv4();
      await db.insert(trackable_record).values({
        id: id,
        user_id: userID,
        trackable_id: trackableId,
        timestamp: dateString,
        time_bucket: dateString,
        updated_at: updatedAt,
        value,
        external_key: "",
      });
      return id;
    },
    [db, trackableId, dateString, userID],
  );
};

/** Hook to get a record delete handler */
export const useRecordDeleteHandler = () => {
  const { db } = usePowersyncDrizzle();
  return useCallback(
    async (recordId: string) => {
      await db
        .delete(trackable_record)
        .where(eq(trackable_record.id, recordId));
    },
    [db],
  );
};

export const useGroupHandlers = () => {
  const { db, userID } = usePowersyncDrizzle();

  const addToGroup = async ({
    trackableId,
    group,
  }: {
    trackableId: string;
    group: string;
  }) => {
    await db.insert(trackable_group).values({
      id: uuidv4(),
      user_id: userID,
      trackable_id: trackableId,
      group,
    });
  };

  const removeFromGroup = async ({
    trackableId,
    group,
  }: {
    trackableId: string;
    group: string;
  }) => {
    await db
      .delete(trackable_group)
      .where(
        and(
          eq(trackable_group.user_id, userID),
          eq(trackable_group.trackable_id, trackableId),
          eq(trackable_group.group, group),
        ),
      );
  };

  return { addToGroup, removeFromGroup };
};

export const useTrackableHandlers = () => {
  const { db, userID } = usePowersyncDrizzle();

  const deleteTrackable = async (id: string) => {
    await db.delete(trackable).where(eq(trackable.id, id));
  };

  const updateTrackableName = async ({
    id,
    name,
  }: {
    id: string;
    name: string;
  }) => {
    await db.update(trackable).set({ name }).where(eq(trackable.id, id));
  };

  const createTrackable = async (
    data: Omit<DbTrackableInsert, "user_id" | "id">,
  ) => {
    const id = uuidv4();
    await db.insert(trackable).values({ ...data, user_id: userID, id });
    return id;
  };

  return { deleteTrackable, updateTrackableName, createTrackable };
};
