import type { ReactNode } from "react";
import { createContext, memo, useContext, useMemo } from "react";
import { useQuery } from "@rocicorp/zero/react";
import { z } from "zod";

import {
  ZColorValue,
  ZNumberColorCoding,
  ZNumberProgressBounds,
} from "@tyl/db/jsonValidators";

import type { ITrackableFlagsZero } from "~/schema";
import { useTrackableMeta } from "~/components/Providers/TrackableProvider";
import { useZ } from "~/utils/useZ";

/*
 * This provides a kv store that is used for trackable settings.
 * It is built in way to support rendering multiple trackables inside.
 * This is useful for stuff like dayview where you don't want to create separate context for each day.
 *
 * I think it can be optimized further by caching some calculations that are the same in each daycell
 */

const FlagsValidators = {
  BooleanCheckedColor: ZColorValue,
  BooleanUncheckedColor: ZColorValue,
  NumberProgessBounds: ZNumberProgressBounds,
  NumberColorCoding: ZNumberColorCoding,

  AnyTrackingStart: z.date(),
  AnyNote: z.string(),
};

export type ITrackableFlagKey = keyof typeof FlagsValidators;

export type ITrackableFlagValue<K extends ITrackableFlagKey> = z.infer<
  (typeof FlagsValidators)[K]
>;

interface ITrackableFlagsContext {
  getFlag: <K extends ITrackableFlagKey>(
    trackableId: string,
    key: K,
  ) => ITrackableFlagValue<K> | undefined;
  setFlag: <K extends ITrackableFlagKey>(
    trackableId: string,
    key: K,
    value: ITrackableFlagValue<K> | undefined,
  ) => Promise<void>;
}

const TrackableFlagsContext = createContext<ITrackableFlagsContext>({
  getFlag: () => undefined,
  setFlag: () => Promise.resolve(),
});

type TrackableId = string;

type MapKey = `${TrackableId}-${ITrackableFlagKey}`;

const createFlagsMap = (flags: readonly ITrackableFlagsZero[]) => {
  const flagMap = new Map<MapKey, ITrackableFlagValue<ITrackableFlagKey>>();

  flags.forEach((flag) => {
    if (!(flag.key in FlagsValidators)) {
      return;
    }
    const validator = FlagsValidators[flag.key as ITrackableFlagKey];
    flagMap.set(
      `${flag.trackableId}--${flag.key as ITrackableFlagKey}`,
      validator.parse(flag.value),
    );
  });

  return flagMap;
};

export type ITrackableFlagsKV = {
  [K in ITrackableFlagKey]: ITrackableFlagValue<K> | undefined;
};

export const createFlagsObjectWithoutId = (
  flags: readonly ITrackableFlagsZero[],
) => {
  const object = {} as ITrackableFlagsKV;

  flags.forEach((flag) => {
    if (!(flag.key in FlagsValidators)) {
      return;
    }
    const validator = FlagsValidators[flag.key as ITrackableFlagKey];
    //@ts-expect-error This is correct
    object[flag.key as ITrackableFlagKey] = validator.parse(flag.value);
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
    return flagsMap.get(`${trackableId}--${key}`);
  };

  const setFlag: ITrackableFlagsContext["setFlag"] = async (
    trackableId,
    key,
    value,
  ) => {
    const validated = FlagsValidators[key].parse(value);

    await z.mutate.TYL_trackableFlags.upsert({
      trackableId: trackableId,
      key: key,
      value: validated as never,
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

export const useTrackableFlags = () => {
  return useContext(TrackableFlagsContext);
};

export const useTrackableFlagIdLock = () => {
  const inCtx = useContext(TrackableFlagsContext);

  const { id } = useTrackableMeta();

  return {
    getFlag: (key: ITrackableFlagKey) => inCtx.getFlag(id, key),
    setFlag: (
      key: ITrackableFlagKey,
      value: ITrackableFlagValue<ITrackableFlagKey>,
    ) => inCtx.setFlag(id, key, value),
  };
};
