import { DbTrackableRecordSelect } from "@tyl/db/client/schema-powersync";
import { format } from "date-fns";
import { createContext, ReactNode, useContext, useId, useLayoutEffect, useMemo } from "react";
import { Store, useStore } from "@tanstack/react-store";

export type ITrackableDataContext = Record<string, DbTrackableRecordSelect[]>;

const DataCache = new Store<Record<string, ITrackableDataContext>>({});

const IdContext = createContext<string | null>(null);

const makeKey = (trackableId: string, date: Date) => `${trackableId}-${format(date, "yyyy-MM-dd")}`;

export const useTrackableDataFromContext = (trackableId: string, date: Date) => {
  const id = useContext(IdContext);

  if (!id) {
    throw new Error("useTrackableDataFromContext: idContext not found");
  }

  const key = useMemo(() => makeKey(trackableId, date), [trackableId, date]);

  const data = useStore(DataCache, (state) => state?.[id]?.[key] ?? [], {
    equal(a, b) {
      if (!a.length && !b.length) return true;
      return (
        a.length === b.length &&
        a.every(
          (item, index) =>
            item.id === b[index]?.id &&
            item.updated_at === b[index]?.updated_at &&
            item.value === b[index]?.value,
        )
      );
    },
  });

  return data;
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
      trackablesSelect: { data: DbTrackableRecordSelect[] }[];
    };

export const TrackableDataProvider = ({
  children,
  recordsSelect,
  trackablesSelect,
}: DataProviderProps) => {
  const id = useId();

  useLayoutEffect(() => {
    DataCache.setState((state) => {
      const remapped = recordsSelect ? recordsSelect : trackablesSelect?.map((t) => t.data).flat();

      const dd = remapped.reduce((acc, record) => {
        const key = makeKey(record.trackable_id, new Date(record.timestamp));

        if (Array.isArray(acc[key])) {
          acc[key].push(record);
        } else {
          acc[key] = [record];
        }

        return acc;
      }, {} as ITrackableDataContext);

      return { ...state, [id]: dd };
    });
  }, [id, recordsSelect, trackablesSelect]);

  return <IdContext.Provider value={id}>{children}</IdContext.Provider>;
};
