import type { ReactNode } from "react";
import { createContext, memo, useContext, useMemo } from "react";
import { useQuery } from "@rocicorp/zero/react";

import type {
  ITrackableFlagKey,
  ITrackableFlagsInputKV,
  ITrackableFlagValue,
  ITrackableFlagValueInput,
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

// TS 5.8 talks about improving some stuff with paraameter retunr inference, maybe something can be refactored when it's released
//https://devblogs.microsoft.com/typescript/announcing-typescript-5-8-beta/#a-note-on-limitations
interface ITrackableFlagsContext {
  getFlag: <K extends ITrackableFlagKey>(
    trackableId: string,
    key: K,
  ) => ITrackableFlagValue<K>;
  setFlag: <K extends ITrackableFlagKey>(
    trackableId: string,
    key: K,
    value: ITrackableFlagValueInput<K>,
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

  // Todo: memo

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
    const validated = FlagsValidators[key].safeParse(value);

    if (!validated.success) {
      throw new Error("Invalid flag value");
    }

    await z.mutate.TYL_trackableFlags.upsert({
      user_id: z.userID,
      trackableId: trackableId,
      key: key,
      value: value,
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
  flags: ITrackableFlagsInputKV;
}) => {
  return (
    <TrackableFlagsContext.Provider
      value={{
        getFlag: (_, key) => {
          const parsed = FlagsValidators[key].safeParse(flags[key]);
          if (!parsed.success) {
            return FlagDefaults[key];
          }
          return parsed.data;
        },
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
