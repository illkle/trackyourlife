import { endOfDay, format, startOfDay } from "date-fns";

import { usePowersyncDrizzle } from "./context";

import {
  and,
  eq,
  gte,
  isNull,
  isUndefined,
  length,
  lte,
  not,
  or,
  useLiveQuery,
} from "@tanstack/react-db";
import {
  flagParser,
  FlagsValidators,
  ITrackableFlagKey,
  ITrackableFlagValue,
  ITrackableFlagValueInput as setNumberBounds,
} from "./trackableFlags";
import { useCallback } from "react";
import { withTrackableFlagsPowersyncID } from "@tyl/db/client/clientIds";

const dateToSQLiteString = (date: Date | number): string => {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS");
};

// Time from dates is ignored. Values from start of firstDay to end of lastDay are included.
interface TrackableRangeParams {
  firstDay: Date;
  lastDay: Date;
}

export const useTrackablesList = ({
  showArchived,
}: {
  showArchived?: boolean;
} = {}) => {
  const { dbT, userID } = usePowersyncDrizzle();

  return useLiveQuery((q) => {
    const favorites = q
      .from({ favoriteGroup: dbT.trackableGroup })
      .where((q) =>
        and(eq(q.favoriteGroup.group, "favorites"), eq(q.favoriteGroup.user_id, userID)),
      );

    const archived = q
      .from({ archivedGroup: dbT.trackableGroup })
      .where((q) =>
        and(eq(q.archivedGroup.group, "archived"), eq(q.archivedGroup.user_id, userID)),
      );

    return q
      .from({ trackable: dbT.trackable })
      .where((v) => eq(v.trackable.user_id, userID))
      .join({ favoriteGroup: favorites }, ({ trackable, favoriteGroup }) =>
        eq(trackable.id, favoriteGroup.trackable_id),
      )
      .join({ archiveGroup: archived }, ({ trackable, archiveGroup }) =>
        eq(trackable.id, archiveGroup.trackable_id),
      )
      .where((v) =>
        showArchived
          ? not(or(isUndefined(v.archiveGroup?.group), isNull(v.archiveGroup?.group)))
          : or(isUndefined(v.archiveGroup?.group), isNull(v.archiveGroup?.group)),
      )
      .orderBy((v) => length(v.favoriteGroup?.group), "desc")
      .orderBy((v) => v.trackable.name);
  });
};

export const useTrackable = ({ id }: { id: string }) => {
  const { dbT, userID } = usePowersyncDrizzle();
  return useLiveQuery((q) =>
    q
      .from({ trackable: dbT.trackable })
      .where((v) => and(eq(v.trackable.user_id, userID), eq(v.trackable.id, id))),
  );
};

interface ByIdParams extends TrackableRangeParams {
  id: string;
}

export const useTrackableData = ({ id, firstDay, lastDay }: ByIdParams) => {
  const { dbT, userID } = usePowersyncDrizzle();
  const startDate = dateToSQLiteString(startOfDay(firstDay));
  const endDate = dateToSQLiteString(endOfDay(lastDay));

  return useLiveQuery((q) =>
    q
      .from({ records: dbT.trackableRecord })
      .where(({ records }) =>
        and(
          eq(records.user_id, userID),
          eq(records.trackable_id, id),
          gte(records.timestamp, startDate),
          lte(records.timestamp, endDate),
        ),
      ),
  );
};

export const useIsTrackableInGroup = (trackableId: string, group: string) => {
  const { dbT, userID } = usePowersyncDrizzle();

  return useLiveQuery((q) =>
    q
      .from({ g: dbT.trackableGroup })
      .where((v) =>
        and(eq(v.g.group, group), eq(v.g.trackable_id, trackableId), eq(v.g.user_id, userID)),
      )
      .findOne()
      .select((v) => v.g.group),
  );
};

export const useTrackableFlag = <K extends ITrackableFlagKey>(trackableId: string, key: K) => {
  const { dbT, userID } = usePowersyncDrizzle();

  const qq = useLiveQuery((q) =>
    q
      .from({ f: dbT.trackableFlags })
      .where((v) =>
        and(eq(v.f.key, key), eq(v.f.trackable_id, trackableId), eq(v.f.user_id, userID)),
      )
      .findOne(),
  );

  const curId = qq.data?.id;

  const setFlag = useCallback(
    async (value: setNumberBounds<K>) => {
      if (key === "AnyTrackingStart") console.log("SET FLAG", { value });

      const validated = FlagsValidators[key].safeParse(value);

      if (!validated.success) {
        throw new Error("Invalid flag value");
      }

      const vv = JSON.stringify(value);

      // Note that we are not writing validated.data here. This is intentional because we do not want zod .transform() to apply here.
      if (curId) {
        console.log("SET FLAG UPDATE");
        dbT.trackableFlags.update(curId, (v) => {
          v.value = vv;
        });
      } else {
        console.log("SET FLAG INSERT");
        dbT.trackableFlags.insert(
          withTrackableFlagsPowersyncID({
            user_id: userID,
            key,
            trackable_id: trackableId,
            value: vv,
          }),
        );
      }
    },
    [dbT, userID, curId],
  );

  return {
    ...qq,
    data: flagParser(qq.data?.value, key) as ITrackableFlagValue<K>,
    setFlag,
  };
};
