import type { ReactNode } from "react";
import {
  createContext,
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { toCompilableQuery } from "@powersync/drizzle-driver";
import { useQuery } from "@powersync/react";
import { Store, useStore } from "@tanstack/react-store";
import { v4 as uuidv4 } from "uuid";

import { usePowersyncDrizzle } from "@tyl/db/client/context";
import {
  DbTrackableFlagsSelect,
  trackable_flags,
} from "@tyl/db/client/schema-powersync";

import type {
  ITrackableFlagKey,
  ITrackableFlagsKV,
  ITrackableFlagValue,
  ITrackableFlagValueInput,
} from "~/components/Trackable/TrackableProviders/trackableFlags";
import {
  FlagDefaults,
  FlagsValidators,
} from "~/components/Trackable/TrackableProviders/trackableFlags";

/*
 * This provides a kv store that is used for trackable settings.
 * It is built in way to support rendering multiple trackables inside.
 * This is useful for stuff like dayview where you don't want to create separate context for each day.
 *
 * I think it can be optimized further by caching some calculations that are the same in each daycell
 */

/*
  Note that those functions are not typically used by components themselves.
  There is a TrackableProvider(nearby file) that wraps getFlag and setFlag and closes over id.
*/

type GetFlagFunction = <K extends ITrackableFlagKey>(
  trackableId: string,
  key: K,
) => ITrackableFlagValue<K>;

type SetFlagFunction = <K extends ITrackableFlagKey>(
  trackableId: string,
  key: K,
  value: ITrackableFlagValueInput<K>,
) => Promise<void>;

interface ITrackableFlagsContext {
  getFlag: GetFlagFunction;
  setFlag: SetFlagFunction;
}

export const TrackableFlagsContext =
  createContext<ITrackableFlagsContext | null>(null);

type KeyStorage = Record<string, Partial<ITrackableFlagsKV>>;

/*
 * Takes a list of flags and returns an object of flags
 */
export const createFlagsObject = (flags: readonly DbTrackableFlagsSelect[]) => {
  const flagMap: KeyStorage = {};

  flags.forEach((flag) => {
    if (!(flag.key in FlagsValidators)) {
      return;
    }
    const key = flag.key as ITrackableFlagKey;
    const validator = FlagsValidators[key];
    // PowerSync stores flag value as string, need to parse JSON
    let valueToValidate: unknown;
    try {
      valueToValidate = JSON.parse(flag.value);
    } catch {
      valueToValidate = flag.value;
    }
    const parsed = validator.safeParse(valueToValidate);
    if (parsed.success) {
      flagMap[flag.trackable_id] ??= {};
      // @ts-expect-error - parsed.data is correctly typed for key, but TS can't verify
      flagMap[flag.trackable_id][key] = parsed.data;
    }
  });

  return flagMap;
};

const FlagStorage = new Store<KeyStorage>({});

let flagStorageLock: string | null = null;

const TrackableFlagsProviderNonMemo = ({
  children,
  trackableIds,
}: {
  children: ReactNode;
  trackableIds?: string[];
}) => {
  const { db } = usePowersyncDrizzle();
  const id = useId();

  // Query all flags (PowerSync will sync only user's data based on sync rules)
  const query = useMemo(
    () => toCompilableQuery(db.query.trackableFlags.findMany()),
    [db],
  );
  const { data: allFlags, isLoading } = useQuery(query);

  // Filter flags if trackableIds provided
  const flags = useMemo(() => {
    if (!allFlags) return [];
    if (!trackableIds || trackableIds.length === 0) return allFlags;
    const idSet = new Set(trackableIds);
    return allFlags.filter((f) => idSet.has(f.trackable_id));
  }, [allFlags, trackableIds]);

  // Update FlagStorage when flags change
  useEffect(() => {
    if (flagStorageLock === null) {
      flagStorageLock = id;
    } else if (flagStorageLock !== id) {
      throw new Error("TrackableFlagsProvider can only be used once");
    }

    FlagStorage.setState(() => createFlagsObject(flags));

    return () => {
      if (flagStorageLock === id) {
        flagStorageLock = null;
      }
    };
  }, [flags, id]);

  if (isLoading) {
    return <></>;
  }

  return children;
};

export const TrackableFlagsProvider = memo(TrackableFlagsProviderNonMemo);

/** CONSUMER API BELOW */

/**
 * Get flag for a trackable.
 * Flag value is reactive and will rerender only on this specific trackableId+flag combination update.
 * Keep in mind that for flags to be available you need to have TrackableFlagsFetcher with trackableId above.
 */
export const useTrackableFlag = <K extends ITrackableFlagKey>(
  trackableId: string,
  key: K,
) => {
  const v = useStore(FlagStorage, (state) => state[trackableId]?.[key]);
  return v ?? FlagDefaults[key];
};

export const useSetTrackableFlag = () => {
  const { db, userID } = usePowersyncDrizzle();

  const setFlag: SetFlagFunction = useCallback(
    async (trackableId, key, value) => {
      const validated = FlagsValidators[key].safeParse(value);

      if (!validated.success) {
        throw new Error("Invalid flag value");
      }

      await db
        .insert(trackable_flags)
        .values({
          id: uuidv4(),
          user_id: userID,
          trackable_id: trackableId,
          key,
          value: validated.data as any,
        })
        .onConflictDoUpdate({
          target: [
            trackable_flags.user_id,
            trackable_flags.trackable_id,
            trackable_flags.key,
          ],
          set: {
            key,
            value: validated.data as any,
          },
        });
    },
    [db, userID],
  );

  return setFlag;
};
