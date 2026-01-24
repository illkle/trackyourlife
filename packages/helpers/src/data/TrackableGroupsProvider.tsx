import { DbTrackableGroupSelect } from "@tyl/db/client/schema-powersync";
import type { ReactNode } from "react";
import { useMemo, useRef } from "react";
import { createContext, useContextSelector } from "@fluentui/react-context-selector";

export type ITrackableGroupsContext = Record<string, boolean>;

const GroupStorageContext = createContext<ITrackableGroupsContext | null>(null);

const makeKey = (trackableId: string, group: string) => `${trackableId}-${group}`;

export const useIsTrackableInGroup = (trackableId: string, group: string) => {
  const key = useMemo(() => makeKey(trackableId, group), [trackableId, group]);
  const data = useContextSelector(GroupStorageContext, (state) => state?.[key]);
  return data ?? false;
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
      trackablesSelect: { id: string; groups: DbTrackableGroupSelect[] }[];
    };
export const TrackableGroupsProvider = ({
  children,
  groupsSelect,
  trackablesSelect,
}: DataProviderProps) => {
  const parsedCacheRef = useRef<ITrackableGroupsContext>({});
  const groupStorage = useMemo(() => {
    const nextCache: ITrackableGroupsContext = {};
    const prevCache = parsedCacheRef.current;

    if (groupsSelect) {
      groupsSelect.forEach((group) => {
        const key = makeKey(group.trackable_id, group.group);
        nextCache[key] = prevCache[key] ?? true;
      });
    } else if (trackablesSelect) {
      trackablesSelect.forEach((trackable) => {
        trackable.groups.forEach((group) => {
          const key = makeKey(trackable.id, group.group);
          nextCache[key] = prevCache[key] ?? true;
        });
      });
    }

    parsedCacheRef.current = nextCache;
    return nextCache;
  }, [groupsSelect, trackablesSelect]);

  return <GroupStorageContext.Provider value={groupStorage}>{children}</GroupStorageContext.Provider>;
};
