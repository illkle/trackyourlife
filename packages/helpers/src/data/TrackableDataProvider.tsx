import { endOfDay, format, startOfDay } from "date-fns";
import { createCollection, liveQueryCollectionOptions } from "@tanstack/react-db";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { createContext, useContextSelector } from "use-context-selector";

import type { DbTrackableRecordSelect } from "@tyl/db/client/schema-powersync";
import { usePowersyncDrizzle } from "./context";
import { buildTrackableDataQuery, ByIdParams, dateToSQLiteString } from "./dbHooksTanstack";
import { useTrackableMeta } from "./TrackableMetaProvider";

const EMPTY_DAY_RECORDS: DbTrackableRecordSelect[] = [];

type TTrackableDataContext = {
  byBucket: Map<string, DbTrackableRecordSelect[]>;
};

const TrackableDataContext = createContext<TTrackableDataContext | null>(null);

const toDayKey = (date: Date) => format(date, "yyyy-MM-dd");

const getRecordDayKey = (record: DbTrackableRecordSelect) => {
  return format(new Date(record.timestamp), "yyyy-MM-dd");
};

const getBucketKey = ({ trackableId, dayKey }: { trackableId: string; dayKey: string }) => {
  return `${trackableId}::${dayKey}`;
};

const getRecordBucketKey = (record: DbTrackableRecordSelect) => {
  return getBucketKey({
    trackableId: record.trackable_id,
    dayKey: getRecordDayKey(record),
  });
};

const recordSort = (a: DbTrackableRecordSelect, b: DbTrackableRecordSelect): number => {
  if (a.timestamp === b.timestamp) {
    return a.id.localeCompare(b.id);
  }
  return a.timestamp.localeCompare(b.timestamp);
};

type TTrackableChange = {
  type: "insert" | "update" | "delete";
  key: string;
  value?: DbTrackableRecordSelect;
};

const applyTrackableChanges = ({
  currentByBucket,
  changes,
  recordsById,
  bucketKeyById,
}: {
  currentByBucket: Map<string, DbTrackableRecordSelect[]>;
  changes: TTrackableChange[];
  recordsById: Map<string, DbTrackableRecordSelect>;
  bucketKeyById: Map<string, string>;
}) => {
  let nextByBucket = currentByBucket;

  // Makes a copy to signal to react that update happened
  const ensureNextMap = () => {
    if (nextByBucket === currentByBucket) {
      nextByBucket = new Map(currentByBucket);
    }
  };

  for (const change of changes) {
    const recordId = change.key;

    if (change.type === "delete") {
      const previous = recordsById.get(recordId);
      const previousBucketKey = bucketKeyById.get(recordId);

      if (!previous || !previousBucketKey) {
        continue;
      }

      const previousBucket = nextByBucket.get(previousBucketKey) ?? EMPTY_DAY_RECORDS;
      const nextBucket = previousBucket.filter((record) => record.id !== recordId);

      ensureNextMap();
      if (nextBucket.length === 0) {
        nextByBucket.delete(previousBucketKey);
      } else {
        nextByBucket.set(previousBucketKey, nextBucket);
      }

      recordsById.delete(recordId);
      bucketKeyById.delete(recordId);
      continue;
    }

    if (!change.value) {
      continue;
    }

    const nextRecord = change.value;
    const nextBucketKey = getRecordBucketKey(nextRecord);
    const previousRecord = recordsById.get(recordId);
    const previousBucketKey = bucketKeyById.get(recordId);

    if (previousRecord && previousBucketKey) {
      const previousBucket = nextByBucket.get(previousBucketKey) ?? EMPTY_DAY_RECORDS;
      const previousBucketWithoutRecord = previousBucket.filter((record) => record.id !== recordId);

      ensureNextMap();
      if (previousBucketWithoutRecord.length === 0) {
        nextByBucket.delete(previousBucketKey);
      } else {
        nextByBucket.set(previousBucketKey, previousBucketWithoutRecord);
      }
    }

    const nextDayBucket = nextByBucket.get(nextBucketKey) ?? EMPTY_DAY_RECORDS;
    const nextDayBucketWithRecord = [...nextDayBucket, nextRecord].sort(recordSort);

    ensureNextMap();
    nextByBucket.set(nextBucketKey, nextDayBucketWithRecord);

    recordsById.set(recordId, nextRecord);
    bucketKeyById.set(recordId, nextBucketKey);
  }

  return nextByBucket;
};

type TTrackableDataProviderProps = ByIdParams & {
  children: ReactNode;
};

export const TrackableDataProvider = ({
  id,
  firstDay,
  lastDay,
  fromArchive,
  children,
}: TTrackableDataProviderProps) => {
  const { dbT, userID } = usePowersyncDrizzle();

  const startDate = useMemo(() => dateToSQLiteString(startOfDay(firstDay)), [firstDay]);
  const endDate = useMemo(() => dateToSQLiteString(endOfDay(lastDay)), [lastDay]);

  const [byBucket, setByBucket] = useState<Map<string, DbTrackableRecordSelect[]>>(() =>
    new Map(),
  );

  const recordsByIdRef = useRef<Map<string, DbTrackableRecordSelect>>(new Map());
  const bucketKeyByIdRef = useRef<Map<string, string>>(new Map());

  const collection = useMemo(() => {
    return createCollection(
      liveQueryCollectionOptions({
        id: `trackable-data-${userID}-${id}-${startDate}-${endDate}-${Boolean(fromArchive)}`,
        query: (q) =>
          buildTrackableDataQuery({
            q,
            dbT,
            userID,
            startDate,
            endDate,
            id,
            fromArchive,
          }),
        getKey: (record) => record.id,
      }),
    );
  }, [dbT, endDate, fromArchive, id, startDate, userID]);

  useEffect(() => {
    recordsByIdRef.current = new Map();
    bucketKeyByIdRef.current = new Map();
    setByBucket(new Map());

    const subscription = collection.subscribeChanges(
      (changes) => {
        setByBucket((current) =>
          applyTrackableChanges({
            currentByBucket: current,
            changes: changes as TTrackableChange[],
            recordsById: recordsByIdRef.current,
            bucketKeyById: bucketKeyByIdRef.current,
          }),
        );
      },
      { includeInitialState: true },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [collection]);

  const contextValue = useMemo(() => ({ byBucket }), [byBucket]);

  return (
    <TrackableDataContext.Provider value={contextValue}>{children}</TrackableDataContext.Provider>
  );
};

export const useTrackableDataDay = (date: Date) => {
  const { id: trackableId } = useTrackableMeta();
  const dayKey = useMemo(() => toDayKey(date), [date]);
  const bucketKey = useMemo(() => getBucketKey({ trackableId, dayKey }), [dayKey, trackableId]);

  const records = useContextSelector(TrackableDataContext, (value) => {
    if (!value) {
      return null;
    }
    return value.byBucket.get(bucketKey) ?? EMPTY_DAY_RECORDS;
  });

  if (!records) {
    throw new Error("useTrackableDataDay must be used within a TrackableDataProvider");
  }

  return records;
};
