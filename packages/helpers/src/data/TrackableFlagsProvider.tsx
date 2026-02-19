import type { ReactNode } from "react";
import { useCallback, useMemo, useRef } from "react";
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
import { createContext, useContextSelector } from "use-context-selector";

/*
 * This provides a kv store that is used for trackable settings.
 * It is built in way to support rendering multiple trackables inside.
 * This is useful for stuff like dayview where you don't want to create separate context for each day.
 *
 * I think it can be optimized further by caching some calculations that are the same in each daycell
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
type RawKeyStorage = Record<string, Partial<Record<ITrackableFlagKey, string>>>;

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
  const rawCacheRef = useRef<RawKeyStorage>({});
  const parsedCacheRef = useRef<KeyStorage>({});
  const flagStorage = useMemo(() => {
    const flags = flagsSelect ?? trackablesSelect!.map((f) => f.flags).flat();
    const nextRawCache: RawKeyStorage = {};
    const nextParsedCache: KeyStorage = {};

    flags.forEach((flag) => {
      if (!(flag.key in FlagsValidators)) {
        return;
      }
      const key = flag.key as ITrackableFlagKey;
      const trackableId = flag.trackable_id;
      const rawValue =
        typeof flag.value === "string" ? (flag.value as string) : JSON.stringify(flag.value);

      const prevRawValue = rawCacheRef.current[trackableId]?.[key];
      const prevParsedValue = parsedCacheRef.current[trackableId]?.[key];

      if (prevRawValue === rawValue && prevParsedValue !== undefined) {
        nextRawCache[trackableId] ??= {};
        nextParsedCache[trackableId] ??= {};
        nextRawCache[trackableId][key] = rawValue;
        // @ts-expect-error - prevParsedValue is correctly typed for key, but TS can't verify
        nextParsedCache[trackableId][key] = prevParsedValue;
        return;
      }

      const validator = FlagsValidators[key];
      let valueToValidate: unknown;
      try {
        valueToValidate = JSON.parse(rawValue);
      } catch {
        valueToValidate = rawValue;
      }
      const parsed = validator.safeParse(valueToValidate);
      if (parsed.success) {
        nextRawCache[trackableId] ??= {};
        nextParsedCache[trackableId] ??= {};
        nextRawCache[trackableId][key] = rawValue;
        // @ts-expect-error - parsed.data is correctly typed for key, but TS can't verify
        nextParsedCache[trackableId][key] = parsed.data;
      } else {
        console.log("parsed failed", parsed.error, valueToValidate);
      }
    });

    rawCacheRef.current = nextRawCache;
    parsedCacheRef.current = nextParsedCache;

    return nextParsedCache;
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

      const exists = await db.query.trackableFlags.findFirst({
        where: and(
          eq(trackable_flags.user_id, userID),
          eq(trackable_flags.trackable_id, trackableId),
          eq(trackable_flags.key, key),
        ),
      });

      if (!exists) {
        await db.insert(trackable_flags).values({
          id: uuidv4(),
          user_id: userID,
          trackable_id: trackableId,
          key,
          value,
        });
        return;
      }

      // Note that we are not using validated.data here. This is intentional because we do not want zod .transform() to apply here.
      await db
        .update(trackable_flags)
        .set({ value })
        .where(
          and(
            eq(trackable_flags.user_id, userID),
            eq(trackable_flags.trackable_id, trackableId),
            eq(trackable_flags.key, key),
          ),
        );
    },
    [db, userID],
  );

  return setFlag;
};
