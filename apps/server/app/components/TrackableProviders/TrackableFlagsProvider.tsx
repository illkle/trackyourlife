import type { ReactNode } from "react";
import { createContext, memo, useContext, useMemo } from "react";
import { useQuery } from "@rocicorp/zero/react";

import type {
  ITrackableFlagKey,
  ITrackableFlagsKV,
  ITrackableFlagValue,
} from "~/components/TrackableProviders/trackableFlags";
import type { ITrackableFlagsZero } from "~/schema";
import {
  FlagDefaults,
  FlagsValidators,
} from "~/components/TrackableProviders/trackableFlags";
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

interface ITrackableFlagsContext {
  getFlag: <K extends ITrackableFlagKey>(
    trackableId: string,
    key: K,
  ) => ITrackableFlagValue<K>;
  setFlag: <K extends ITrackableFlagKey>(
    trackableId: string,
    key: K,
    value: ITrackableFlagValue<K>,
  ) => Promise<void>;
}

export const TrackableFlagsContext =
  createContext<ITrackableFlagsContext | null>(null);

type TrackableId = string;
type MapKey = `${TrackableId}-${ITrackableFlagKey}`;

/*
  Takes a list of flags(from zero query) and returns a map of flags for provider
*/
export const createFlagsMap = (flags: readonly ITrackableFlagsZero[]) => {
  const flagMap = new Map<MapKey, ITrackableFlagValue<ITrackableFlagKey>>();

  flags.forEach((flag) => {
    if (!(flag.key in FlagsValidators)) {
      return;
    }
    const validator = FlagsValidators[flag.key as ITrackableFlagKey];
    const parsed = validator.safeParse(flag.value);
    if (parsed.success) {
      flagMap.set(
        `${flag.trackableId}--${flag.key as ITrackableFlagKey}`,
        parsed.data,
      );
    }
  });

  return flagMap;
};

/*
  Helper for settings form
*/
export const createFlagsObjectWithoutId = (
  flags: readonly ITrackableFlagsZero[],
) => {
  const object = {} as ITrackableFlagsKV;

  flags.forEach((flag) => {
    if (!(flag.key in FlagsValidators)) {
      return;
    }
    const validator = FlagsValidators[flag.key as ITrackableFlagKey];

    const parsed = validator.safeParse(flag.value);

    if (parsed.success) {
      const key = flag.key as ITrackableFlagKey;
      // @ts-expect-error this is fine
      object[key] = parsed.data;
    }
  });

  return object;
};

const TrackableFlagsProviderNonMemo = ({
  children,
  trackableIds,
}: {
  children: ReactNode;
  trackableIds?: string[];
}) => {
  const z = useZ();

  const [flags] = useQuery(
    trackableIds
      ? z.query.TYL_trackableFlags.where("trackableId", "IN", trackableIds)
      : z.query.TYL_trackableFlags,
  );

  const flagsMap = useMemo(() => {
    return createFlagsMap(flags);
  }, [flags]);

  const getFlag: ITrackableFlagsContext["getFlag"] = (trackableId, key) => {
    const flag = flagsMap.get(`${trackableId}--${key}`);

    if (!flag) {
      return FlagDefaults[key];
    }

    return flag;
  };

  const setFlag: ITrackableFlagsContext["setFlag"] = async (
    trackableId,
    key,
    value,
  ) => {
    const validated = FlagsValidators[key].parse(value);

    await z.mutate.TYL_trackableFlags.upsert({
      user_id: z.userID,
      trackableId: trackableId,
      key: key,
      value: validated,
    });
  };

  return (
    <TrackableFlagsContext.Provider value={{ getFlag, setFlag }}>
      {children}
    </TrackableFlagsContext.Provider>
  );
};

export const TrackableFlagsProvider = memo(TrackableFlagsProviderNonMemo);

export const TrackableFlagsProviderMock = ({
  children,
  flags,
}: {
  children: ReactNode;
  flags: ITrackableFlagsKV;
}) => {
  return (
    <TrackableFlagsContext.Provider
      value={{
        getFlag: (_, key) => flags[key],
        setFlag: () => Promise.resolve(),
      }}
    >
      {children}
    </TrackableFlagsContext.Provider>
  );
};

// Todo delete
export const useTrackableFlags = () => {
  const context = useContext(TrackableFlagsContext);

  if (!context) {
    throw new Error(
      "UseTrackableFlags must be used within a TrackableFlagsProvider.",
    );
  }

  return context;
};
