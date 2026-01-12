import type { ReactNode } from "react";
import {
  createContext,
  memo,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useState,
} from "react";
import { useZero } from "@rocicorp/zero/react";
import { Store, useStore } from "@tanstack/react-store";

import type { ITrackableFlagsZero } from "@tyl/db/zero-schema";
import { mutators } from "@tyl/db/mutators";
import { queries } from "@tyl/db/queries";

import type {
  ITrackableFlagKey,
  ITrackableFlagsKV,
  ITrackableFlagValue,
  ITrackableFlagValueInput,
} from "~/components/Trackable/TrackableProviders/trackableFlags";
import { Spinner } from "~/@shad/components/spinner";
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

// TS 5.8 talks about improving some stuff with parameter return inference, maybe something can be refactored when it's released
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

type KeyStorage = Record<string, Partial<ITrackableFlagsKV>>;

/*
 * Takes a list of flags(from zero query) and returns an object of flags
 */
export const createFlagsObject = (flags: readonly ITrackableFlagsZero[]) => {
  const flagMap: KeyStorage = {};

  flags.forEach((flag) => {
    if (!(flag.key in FlagsValidators)) {
      return;
    }
    const key = flag.key as ITrackableFlagKey;
    const validator = FlagsValidators[key];
    const parsed = validator.safeParse(flag.value);
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
  const zero = useZero();

  const id = useId();

  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (flagStorageLock === null) {
      flagStorageLock = id;
    } else if (flagStorageLock !== id) {
      throw new Error("TrackableFlagsProvider can only be used once");
    }

    const q = queries.flags({ ids: trackableIds ?? [] });
    const m = zero.materialize(q);

    FlagStorage.setState(() => createFlagsObject(m.data));
    setReady(true);

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
  }, [trackableIds, zero, id]);

  if (!ready) {
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
  const zero = useZero();

  const setFlag: SetFlagFunction = useCallback(
    async (trackableId, key, value) => {
      const validated = FlagsValidators[key].safeParse(value);

      if (!validated.success) {
        throw new Error("Invalid flag value");
      }

      await zero.mutate(
        mutators.trackableFlags.upsert({
          trackable_id: trackableId,
          key: key,
          value: value,
        }),
      );
    },
    [zero],
  );

  return setFlag;
};
