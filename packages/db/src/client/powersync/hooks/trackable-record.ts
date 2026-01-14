/**
 * Trackable record React hooks
 */

import { useCallback, useMemo } from "react";
import { toCompilableQuery } from "@powersync/drizzle-driver";
import { useQuery } from "@powersync/react";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { trackableRecord } from "../../schema-powersync";
import { usePowersyncDrizzle } from "../context";
import { deleteRecord, updateRecord, upsertRecord } from "../trackable-record";

/** Convert a Date to ISO string for storage in PowerSync (UTC midnight) */
export const dateToISOString = (date: Date): string => {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  ).toISOString();
};

/** Hook to get trackable records within a date range (for all trackables) */
export const useTrackableRecords = (startDate: string, endDate: string) => {
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

/** Hook to get records for a specific trackable within a date range */
export const useTrackableData = (
  trackableId: string,
  startDate: string,
  endDate: string,
) => {
  const db = usePowersyncDrizzle();
  const query = useMemo(
    () =>
      toCompilableQuery(
        db.query.trackableRecord.findMany({
          where: and(
            eq(trackableRecord.trackable_id, trackableId),
            gte(trackableRecord.date, startDate),
            lte(trackableRecord.date, endDate),
          ),
          orderBy: [asc(trackableRecord.date), asc(trackableRecord.created_at)],
        }),
      ),
    [db, trackableId, startDate, endDate],
  );
  return useQuery(query);
};

/** Hook to get a record update handler for a specific trackable and date */
export const useRecordUpdateHandler = ({
  date,
  trackableId,
  userId,
}: {
  date: Date;
  trackableId: string;
  userId: string;
}) => {
  const db = usePowersyncDrizzle();
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
