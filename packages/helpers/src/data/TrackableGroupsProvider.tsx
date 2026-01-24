import { DbTrackableGroupSelect } from "@tyl/db/client/schema-powersync";
import { createContext, ReactNode, useContext, useId, useLayoutEffect, useMemo } from "react";
import { Store, useStore } from "@tanstack/react-store";

export type ITrackableGroupsContext = Record<string, boolean>;

const DataCache = new Store<Record<string, ITrackableGroupsContext>>({});

const IdContext = createContext<string | null>(null);

const makeKey = (trackableId: string, group: string) => `${trackableId}-${group}`;

export const useIsTrackableInGroup = (trackableId: string, group: string) => {
  const id = useContext(IdContext);

  if (!id) {
    throw new Error("useIsTrackableInGroup: idContext not found");
  }

  const key = useMemo(() => makeKey(trackableId, group), [trackableId, group]);

  const data = useStore(DataCache, (state) => state?.[id]?.[key] ?? false, {});

  return data;
};

type DataProviderProps =
  | {
      children: ReactNode;
      groupsSelect: DbTrackableGroupSelect[];
      trackablesSelect?: never;
    }
  | {
      children: ReactNode;
      groupsSelect?: never;
      trackablesSelect: { groups: DbTrackableGroupSelect[] }[];
    };
export const TrackableGroupsProvider = ({
  children,
  groupsSelect,
  trackablesSelect,
}: DataProviderProps) => {
  const id = useId();

  useLayoutEffect(() => {
    const remapped = groupsSelect ? groupsSelect : trackablesSelect?.map((t) => t.groups).flat();

    DataCache.setState((state) => {
      const dd = remapped.reduce((acc, group) => {
        acc[makeKey(group.trackable_id, group.group)] = true;
        return acc;
      }, {} as ITrackableGroupsContext);

      return { ...state, [id]: dd };
    });
  }, [id, groupsSelect, trackablesSelect]);

  return <IdContext.Provider value={id}>{children}</IdContext.Provider>;
};
