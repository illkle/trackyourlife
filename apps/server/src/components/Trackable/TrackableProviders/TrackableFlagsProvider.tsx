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
import { and, eq, inArray } from "drizzle-orm";
import { Spinner } from "~/@shad/components/spinner";

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
    // PowerSync stores values as JSON strings, parse them
    let valueToValidate: unknown;
    try {
      valueToValidate = JSON.parse(flag.value as string);
    } catch {
      valueToValidate = flag.value;
    }
    const parsed = validator.safeParse(valueToValidate);
    if (parsed.success) {
      flagMap[flag.trackable_id] ??= {};
      // @ts-expect-error - parsed.data is correctly typed for key, but TS can't verify
      flagMap[flag.trackable_id][key] = parsed.data;
    } else {
      console.log("parsed failed", parsed.error, valueToValidate);
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
    () => toCompilableQuery(db.query.trackableFlags.findMany({
      where: trackableIds ? inArray(trackable_flags.trackable_id, trackableIds) : undefined,
    })),
    [db, trackableIds],
  );
  const { data: allFlags, isLoading } = useQuery(query);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (flagStorageLock === null) {
      flagStorageLock = id;
    } else if (flagStorageLock !== id) {
      throw new Error("TrackableFlagsProvider can only be used once");
    }

    FlagStorage.setState(() => createFlagsObject(allFlags));

    // Kinda crude hack, ideally we need a better way to provide flags
    if (!isLoading) {
      setIsReady(true);
    }

    return () => {
      if (flagStorageLock === id) {
        flagStorageLock = null;
      }
    };
  }, [allFlags, id, isLoading]);

  if (isLoading || !isReady) {
    return <><Spinner /></>;
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

      // Note that we are not using validated.data here. This is intentional because we do not want zod .transform() to apply here.
      const r = await db.update(trackable_flags).set({
        value,
      }).where(and(
        eq(trackable_flags.user_id, userID),
        eq(trackable_flags.trackable_id, trackableId),
        eq(trackable_flags.key, key),
      ));

      if (r.rowsAffected === 0) {
        await db
          .insert(trackable_flags)
          .values({
            id: uuidv4(),
            user_id: userID,
            trackable_id: trackableId,
            key,
            value,
          })
      }
    },
    [db, userID],
  );

  return setFlag;
};
