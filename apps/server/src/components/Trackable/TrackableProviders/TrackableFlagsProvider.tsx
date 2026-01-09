import type { ReactNode } from "react";
import { createContext, memo, useCallback, useEffect, useId } from "react";
import { Store, useStore } from "@tanstack/react-store";

import type { ITrackableFlagsZero } from "@tyl/db/zero-schema";
import { mutators } from "@tyl/db/mutators";

import type {
  ITrackableFlagKey,
  ITrackableFlagValue,
  ITrackableFlagValueInput,
} from "~/components/Trackable/TrackableProviders/trackableFlags";
import {
  FlagDefaults,
  FlagsValidators,
} from "~/components/Trackable/TrackableProviders/trackableFlags";
import { useZ } from "~/utils/useZ";

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

// TS 5.8 talks about improving some stuff with paraameter retunr inference, maybe something can be refactored when it's released
//https://devblogs.microsoft.com/typescript/announcing-typescript-5-8-beta/#a-note-on-limitations

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

type TrackableId = string;
type MapKey = `${TrackableId}-${ITrackableFlagKey}`;

type KeyStorage = Record<MapKey, ITrackableFlagValue<ITrackableFlagKey>>;

/*
 * Takes a list of flags(from zero query) and returns an object of flags
 */
export const createFlagsObject = (flags: readonly ITrackableFlagsZero[]) => {
  const flagMap = {} as KeyStorage;

  flags.forEach((flag) => {
    if (!(flag.key in FlagsValidators)) {
      return;
    }
    const validator = FlagsValidators[flag.key as ITrackableFlagKey];
    const parsed = validator.safeParse(flag.value);
    if (parsed.success) {
      flagMap[`${flag.trackableId}--${flag.key as ITrackableFlagKey}`] =
        parsed.data;
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
  const z = useZ();

  const id = useId();

  useEffect(() => {
    if (flagStorageLock === null) {
      flagStorageLock = id;
    } else if (flagStorageLock !== id) {
      throw new Error("TrackableFlagsProvider can only be used once");
    }

    const q = trackableIds
      ? z.query.TYL_trackableFlags.where("trackableId", "IN", trackableIds)
      : z.query.TYL_trackableFlags;

    const m = q.materialize();

    m.addListener((flagsUpdate) => {
      // Casting to unknown to avoid type instanstiation is too deep error
      const f = createFlagsObject(
        flagsUpdate as unknown as ITrackableFlagsZero[],
      );

      FlagStorage.setState(() => f);
    });

    return () => {
      if (flagStorageLock === id) {
        flagStorageLock = null;
      }
      m.destroy();
    };
  }, [trackableIds, z, id]);

  return children;
};

export const TrackableFlagsProvider = memo(TrackableFlagsProviderNonMemo);

/** CONSUMER API BELOW */

/**
 * Get flag for a trackable.
 * Flag value is reactive and will rerender only on this specific trackableId+flag combination update.
 * Keep in mind that for flags to be available you need to have TrackableFlagsFetcher with trackableId above.
 */
export const useTrackableFlag: GetFlagFunction = (trackableId, key) => {
  const v = useStore(FlagStorage, (state) => state[`${trackableId}--${key}`]);
  return v ?? FlagDefaults[key];
};

export const useSetTrackableFlag = () => {
  const z = useZ();

  const setFlag: SetFlagFunction = useCallback(
    async (trackableId, key, value) => {
      const validated = FlagsValidators[key].safeParse(value);

      if (!validated.success) {
        throw new Error("Invalid flag value");
      }

      await mutators.trackableFlags.upsert({
        trackableId: trackableId,
        key: key,
        value: value,
      });
    },
    [z],
  );

  return setFlag;
};
