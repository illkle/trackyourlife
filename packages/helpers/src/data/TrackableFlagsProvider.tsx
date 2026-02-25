import { createCollection, liveQueryCollectionOptions } from "@tanstack/react-db";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { createContext, useContextSelector } from "use-context-selector";

import type { DbTrackableFlagsSelect } from "@tyl/db/client/schema-powersync";
import { usePowersyncDrizzle } from "./context";
import { buildTrackableFlagsQuery, type TrackableFlagsParams } from "./dbHooksTanstack";
import {
  FlagDefaults,
  FlagsValidators,
  flagParser,
  type ITrackableFlagKey,
  type ITrackableFlagValue,
} from "./trackableFlags";
import { useTrackableMeta } from "./TrackableMetaProvider";

type TTrackableFlagsContext = {
  byLookupKey: Map<string, ITrackableFlagValue<ITrackableFlagKey>>;
};

const TrackableFlagsContext = createContext<TTrackableFlagsContext | null>(null);

const getLookupKey = ({ trackableId, key }: { trackableId: string; key: string }) => {
  return `${trackableId}::${key}`;
};

const getFlagLookupKey = (row: DbTrackableFlagsSelect) => {
  return getLookupKey({ trackableId: row.trackable_id, key: row.key });
};

type TFlagChange = {
  type: "insert" | "update" | "delete";
  key: string;
  value?: DbTrackableFlagsSelect;
};

const applyFlagChanges = ({
  currentByLookup,
  changes,
  rowsById,
}: {
  currentByLookup: Map<string, ITrackableFlagValue<ITrackableFlagKey>>;
  changes: TFlagChange[];
  rowsById: Map<string, DbTrackableFlagsSelect>;
}) => {
  let nextByLookup = currentByLookup;

  const ensureNextMap = () => {
    if (nextByLookup === currentByLookup) {
      nextByLookup = new Map(currentByLookup);
    }
  };

  for (const change of changes) {
    const rowId = change.key;

    if (change.type === "delete") {
      const previous = rowsById.get(rowId);
      if (!previous) {
        continue;
      }

      ensureNextMap();
      nextByLookup.delete(getFlagLookupKey(previous));
      rowsById.delete(rowId);
      continue;
    }

    if (!change.value) {
      continue;
    }

    const previous = rowsById.get(rowId);
    if (previous) {
      ensureNextMap();
      nextByLookup.delete(getFlagLookupKey(previous));
    }

    const nextRow = change.value;
    const nextKey = nextRow.key;

    if (!(nextKey in FlagsValidators)) {
      continue;
    }

    const parsedValue = flagParser(nextRow.value, nextKey as ITrackableFlagKey);

    ensureNextMap();
    nextByLookup.set(
      getFlagLookupKey(nextRow),
      parsedValue as ITrackableFlagValue<ITrackableFlagKey>,
    );
    rowsById.set(rowId, nextRow);
  }

  return nextByLookup;
};

type TTrackableFlagsProviderProps = TrackableFlagsParams & {
  children: ReactNode;
};

export const TrackableFlagsProvider = ({
  id,
  fromArchive,
  children,
}: TTrackableFlagsProviderProps) => {
  const { dbT, userID } = usePowersyncDrizzle();

  const [byLookupKey, setByLookupKey] = useState<
    Map<string, ITrackableFlagValue<ITrackableFlagKey>>
  >(() => new Map());
  const rowsByIdRef = useRef<Map<string, DbTrackableFlagsSelect>>(new Map());

  const collection = useMemo(() => {
    return createCollection(
      liveQueryCollectionOptions({
        id: `trackable-flags-${userID}-${id}-${Boolean(fromArchive)}`,
        query: (q) =>
          buildTrackableFlagsQuery({
            q,
            dbT,
            userID,
            id,
            fromArchive,
          }),
        getKey: (row) => row.id,
      }),
    );
  }, [dbT, fromArchive, id, userID]);

  useEffect(() => {
    rowsByIdRef.current = new Map();
    setByLookupKey(new Map());

    const subscription = collection.subscribeChanges(
      (changes) => {
        setByLookupKey((current) =>
          applyFlagChanges({
            currentByLookup: current,
            changes: changes as TFlagChange[],
            rowsById: rowsByIdRef.current,
          }),
        );
      },
      { includeInitialState: true },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [collection]);

  const contextValue = useMemo(() => ({ byLookupKey }), [byLookupKey]);

  return (
    <TrackableFlagsContext.Provider value={contextValue}>{children}</TrackableFlagsContext.Provider>
  );
};

export const useTrackableFlagValueCached = <K extends ITrackableFlagKey>(key: K) => {
  const { id: trackableId } = useTrackableMeta();
  const lookupKey = useMemo(() => getLookupKey({ trackableId, key }), [key, trackableId]);

  const raw = useContextSelector(TrackableFlagsContext, (value) => {
    if (!value) {
      return null;
    }
    return value.byLookupKey.get(lookupKey);
  });

  return (raw ?? FlagDefaults[key]) as ITrackableFlagValue<K>;
};
