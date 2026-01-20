import type { ReactNode } from "react";
import { useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";

import { usePowersyncDrizzle } from "@tyl/db/client/context";
import { DbTrackableFlagsSelect, trackable_flags } from "@tyl/db/client/schema-powersync";

import type {
  ITrackableFlagKey,
  ITrackableFlagsKV,
  ITrackableFlagValue,
  ITrackableFlagValueInput,
} from "./trackableFlags";
import { FlagDefaults, FlagsValidators } from "./trackableFlags";
import { and, eq } from "drizzle-orm";
import { createContext, useContextSelector } from "@fluentui/react-context-selector";

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

export const TrackableFlagsContext = createContext<ITrackableFlagsContext | null>(null);

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

const FlagStorageContext = createContext<KeyStorage | null>(null);

type FLagsProviderProps =
  | {
      children: ReactNode;
      trackablesSelect: { flags: DbTrackableFlagsSelect[] }[];
      flagsSelect?: never;
    }
  | {
      children: ReactNode;
      flagsSelect: DbTrackableFlagsSelect[];
      trackablesSelect?: never;
    };

export const TrackableFlagsProviderExternal = ({
  children,
  flagsSelect,
  trackablesSelect,
}: FLagsProviderProps) => {
  const flagStorage = useMemo(() => {
    if (flagsSelect) {
      return createFlagsObject(flagsSelect);
    }
    return createFlagsObject(trackablesSelect!.map((f) => f.flags).flat());
  }, [flagsSelect, trackablesSelect]);

  return <FlagStorageContext.Provider value={flagStorage}>{children}</FlagStorageContext.Provider>;
};

/** CONSUMER API BELOW */

/**
 * Get flag for a trackable.
 * Flag value is reactive and will rerender only on this specific trackableId+flag combination update.
 * Keep in mind that for flags to be available you need to have TrackableFlagsFetcher with trackableId above.
 */
export const useTrackableFlag = <K extends ITrackableFlagKey>(trackableId: string, key: K) => {
  const v = useContextSelector(FlagStorageContext, (state) => state?.[trackableId]?.[key]);
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
      const r = await db
        .update(trackable_flags)
        .set({
          value,
        })
        .where(
          and(
            eq(trackable_flags.user_id, userID),
            eq(trackable_flags.trackable_id, trackableId),
            eq(trackable_flags.key, key),
          ),
        );

      if (r.rowsAffected === 0) {
        await db.insert(trackable_flags).values({
          id: uuidv4(),
          user_id: userID,
          trackable_id: trackableId,
          key,
          value,
        });
      }
    },
    [db, userID],
  );

  return setFlag;
};
