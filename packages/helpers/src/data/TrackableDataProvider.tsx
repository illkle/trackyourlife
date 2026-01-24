import { format } from "date-fns";
import type { ReactNode } from "react";
import { useMemo, useRef } from "react";
import { DbTrackableRecordSelect } from "@tyl/db/client/schema-powersync";
import { createContext, useContextSelector } from "@fluentui/react-context-selector";

export type ITrackableDataContext = Record<string, DbTrackableRecordSelect[]>;

const DataStorageContext = createContext<ITrackableDataContext | null>(null);

const makeKey = (trackableId: string, date: Date) => `${trackableId}-${format(date, "yyyy-MM-dd")}`;

const areRecordsEqual = (left: DbTrackableRecordSelect[], right: DbTrackableRecordSelect[]) => {
  if (!left.length && !right.length) return true;
  return (
    left.length === right.length &&
    left.every(
      (item, index) =>
        item.id === right[index]?.id &&
        item.updated_at === right[index]?.updated_at &&
        item.value === right[index]?.value,
    )
  );
};

export const useTrackableDataFromContext = (trackableId: string, date: Date) => {
  const key = useMemo(() => makeKey(trackableId, date), [trackableId, date]);
  const data = useContextSelector(DataStorageContext, (state) => state?.[key]);
  return data ?? [];
};

type DataProviderProps =
  | {
      children: ReactNode;
      recordsSelect: DbTrackableRecordSelect[];
      trackablesSelect?: never;
    }
  | {
      children: ReactNode;
      recordsSelect?: never;
      trackablesSelect: { id: string; data: DbTrackableRecordSelect[] }[];
    };

const addTrackableRecordsToCache = (
  trackableId: string,
  records: DbTrackableRecordSelect[],
  prevCache: ITrackableDataContext,
  nextCache: ITrackableDataContext,
) => {
  if (records.length === 0) return;

  let currentKey: string | null = null;
  let currentRecords: DbTrackableRecordSelect[] = [];

  records.forEach((record) => {
    const key = makeKey(trackableId, new Date(record.timestamp));

    if (currentKey && currentKey !== key) {
      const prev = prevCache[currentKey];
      nextCache[currentKey] = prev && areRecordsEqual(prev, currentRecords) ? prev : currentRecords;
      currentKey = key;
      currentRecords = [record];
      return;
    }

    currentKey = key;
    currentRecords.push(record);
  });

  if (currentKey) {
    const prev = prevCache[currentKey];
    nextCache[currentKey] = prev && areRecordsEqual(prev, currentRecords) ? prev : currentRecords;
  }
};

export const TrackableDataProvider = ({
  children,
  recordsSelect,
  trackablesSelect,
}: DataProviderProps) => {
  const parsedCacheRef = useRef<ITrackableDataContext>({});
  const dataStorage = useMemo(() => {
    const nextCache: ITrackableDataContext = {};
    const prevCache = parsedCacheRef.current;

    if (recordsSelect) {
      const trackableId = recordsSelect[0]?.trackable_id;
      if (trackableId) {
        addTrackableRecordsToCache(trackableId, recordsSelect, prevCache, nextCache);
      }
    } else if (trackablesSelect) {
      trackablesSelect.forEach((trackable) => {
        addTrackableRecordsToCache(trackable.id, trackable.data, prevCache, nextCache);
      });
    }

    parsedCacheRef.current = nextCache;
    return nextCache;
  }, [recordsSelect, trackablesSelect]);

  return <DataStorageContext.Provider value={dataStorage}>{children}</DataStorageContext.Provider>;
};
