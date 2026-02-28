import { endOfDay, format, startOfDay } from "date-fns";

import { usePowersyncDrizzle } from "./context";

import {
  and,
  eq,
  gte,
  InitialQueryBuilder,
  isNull,
  isUndefined,
  length,
  lte,
  not,
  or,
  throttleStrategy,
  useLiveQuery,
  usePacedMutations,
} from "@tanstack/react-db";
import {
  flagParser,
  FlagsValidators,
  ITrackableFlagKey,
  ITrackableFlagValue,
  ITrackableFlagValueInput,
} from "./trackableFlags";
import { useCallback } from "react";
import { useTrackableMeta } from "./TrackableMetaProvider";
import {
  withTrackableFlagsPowersyncID,
  withTrackableGroupPowersyncID,
} from "@tyl/db/client/clientIds";
import { v4 as uuidv4 } from "uuid";
import { DbTrackableInsert, DbTrackableSelect } from "@tyl/db/client/schema-powersync";
import { TanstackDBType } from "./tanstack";

export const dateToSQLiteString = (date: Date | number): string => {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss.SSS");
};

const getTimeBucket = ({
  date,
  bucketing,
}: {
  date: Date;
  bucketing?: DbTrackableSelect["bucketing"];
}) => {
  if (bucketing === "day") {
    return dateToSQLiteString(startOfDay(date));
  }

  return null;
};

// Time from dates is ignored. Values from start of firstDay to end of lastDay are included.
export interface TrackableRangeParams {
  firstDay: Date;
  lastDay: Date;
}

export const useTrackablesList = ({
  showArchived,
}: {
  showArchived?: boolean;
} = {}) => {
  const { dbT, userID } = usePowersyncDrizzle();

  return useLiveQuery(
    (q) => {
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
    },
    [userID, showArchived],
  );
};

export const useTrackable = ({ id }: { id: string }) => {
  const { dbT, userID } = usePowersyncDrizzle();
  return useLiveQuery(
    (q) =>
      q
        .from({ trackable: dbT.trackable })
        .where((v) => and(eq(v.trackable.user_id, userID), eq(v.trackable.id, id))),
    [id, userID, id],
  );
};

export interface ByIdParams extends TrackableRangeParams {
  id?: string;
  fromArchive?: boolean;
}

export interface TrackableFlagsParams {
  id?: string;
  fromArchive?: boolean;
}

export const buildTrackableDataQuery = ({
  q,
  dbT,
  userID,
  id,
  startDate,
  endDate,
  fromArchive,
}: {
  q: InitialQueryBuilder;
  dbT: TanstackDBType;
  userID: string;
  id?: string;
  startDate: string;
  endDate: string;
  fromArchive?: boolean;
}) => {
  if (id) {
    return q
      .from({ records: dbT.trackableRecord })
      .where(({ records }) =>
        and(
          eq(records.user_id, userID),
          gte(records.timestamp, startDate),
          lte(records.timestamp, endDate),
          eq(records.trackable_id, id),
        ),
      );
  }

  const archived = q
    .from({ archivedGroup: dbT.trackableGroup })
    .where((q) => and(eq(q.archivedGroup.group, "archived"), eq(q.archivedGroup.user_id, userID)));

  return q
    .from({ records: dbT.trackableRecord })
    .join({ archived }, (v) => eq(v.records.trackable_id, v.archived.trackable_id), "left")
    .where(({ records, archived }) =>
      and(
        eq(records.user_id, userID),
        gte(records.timestamp, startDate),
        lte(records.timestamp, endDate),
        fromArchive ? eq(archived?.group, "archived") : isUndefined(archived?.group),
      ),
    )
    .select((v) => ({ ...v.records }));
};

export const buildTrackableFlagsQuery = ({
  q,
  dbT,
  userID,
  id,
  fromArchive,
}: {
  q: InitialQueryBuilder;
  dbT: TanstackDBType;
  userID: string;
  id?: string;
  fromArchive?: boolean;
}) => {
  if (id) {
    return q
      .from({ flags: dbT.trackableFlags })
      .where(({ flags }) => and(eq(flags.user_id, userID), eq(flags.trackable_id, id)));
  }

  const archived = q
    .from({ archivedGroup: dbT.trackableGroup })
    .where((query) =>
      and(eq(query.archivedGroup.group, "archived"), eq(query.archivedGroup.user_id, userID)),
    );

  return q
    .from({ flags: dbT.trackableFlags })
    .join({ archived }, (v) => eq(v.flags.trackable_id, v.archived.trackable_id), "left")
    .where(({ flags, archived }) =>
      and(
        eq(flags.user_id, userID),
        fromArchive ? eq(archived?.group, "archived") : isUndefined(archived?.group),
      ),
    )
    .select((v) => ({ ...v.flags }));
};

export const useTrackableData = (p: ByIdParams) => {
  const { dbT, userID } = usePowersyncDrizzle();

  const startDate = dateToSQLiteString(startOfDay(p.firstDay));
  const endDate = dateToSQLiteString(endOfDay(p.lastDay));

  const q = useLiveQuery(
    (q) => {
      console.log("trackable data q");
      return buildTrackableDataQuery({
        q,
        dbT,
        userID,
        startDate,
        endDate,
        id: p.id,
        fromArchive: p.fromArchive,
      });
    },
    [p.id, startDate, endDate, p.fromArchive, userID],
  );

  return q;
};

export const useIsTrackableInGroup = (trackableId: string, group: string) => {
  const { dbT, userID } = usePowersyncDrizzle();

  const qq = useLiveQuery(
    (q) =>
      q
        .from({ g: dbT.trackableGroup })
        .where((v) =>
          and(eq(v.g.group, group), eq(v.g.trackable_id, trackableId), eq(v.g.user_id, userID)),
        )
        .findOne(),
    [userID, trackableId, group],
  );

  const toggleGroup = useCallback(async () => {
    if (qq.data?.id) {
      await dbT.trackableGroup.delete(qq.data.id);
    } else {
      await dbT.trackableGroup.insert(
        withTrackableGroupPowersyncID({
          group: group,
          trackable_id: trackableId,
          user_id: userID,
        }),
      );
    }
  }, [qq.data?.id]);

  return { ...qq, data: Boolean(qq.data), toggleGroup };
};

export const useTrackableFlag = <K extends ITrackableFlagKey>(trackableId: string, key: K) => {
  const { dbT, userID, transactor } = usePowersyncDrizzle();

  const qq = useLiveQuery(
    (q) =>
      q
        .from({ f: dbT.trackableFlags })
        .where((v) =>
          and(eq(v.f.key, key), eq(v.f.trackable_id, trackableId), eq(v.f.user_id, userID)),
        )
        .findOne(),
    [userID, trackableId, key],
  );

  const curId = qq.data?.id;

  const setFlagV2 = usePacedMutations<ITrackableFlagValueInput<K>>({
    onMutate: (value) => {
      const validated = FlagsValidators[key].safeParse(value);

      if (!validated.success) {
        console.log(validated.error);
        throw new Error("Invalid flag value");
      }

      const vv = JSON.stringify(value);

      // Note that we are not writing validated.data here. This is intentional because we do not want zod .transform() to apply here.
      if (curId) {
        dbT.trackableFlags.update(curId, (v) => {
          v.value = vv;
        });
      } else {
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
    mutationFn: async ({ transaction }) => {
      await transactor.applyTransaction(transaction);
    },
    strategy: throttleStrategy({ wait: 300, leading: true }),
  });

  const clearFlag = () => {
    if (curId) {
      dbT.trackableFlags.delete(curId);
    }
  };

  return {
    ...qq,
    raw: qq.data,
    data: flagParser(qq.data?.value, key) as ITrackableFlagValue<K>,
    setFlag: setFlagV2,
    clearFlag,
  };
};

/** Hook to get a record update/create handler */
export const useRecordUpdateHandler = ({ date }: { date: Date }) => {
  const { id: trackableId, type: _type, bucketing } = useTrackableMeta();
  const { dbT, userID } = usePowersyncDrizzle();
  const dateString = dateToSQLiteString(date);
  const timeBucket = getTimeBucket({ date, bucketing });

  return useCallback(
    async ({
      value,
      recordId,
      updatedAt,
    }: {
      value: string;
      recordId?: string;
      updatedAt?: number;
    }) => {
      if (recordId) {
        await dbT.trackableRecord.update(recordId, (v) => {
          v.updated_at = updatedAt;
          v.value = value;
        });

        return recordId;
      }

      const id = uuidv4();
      await dbT.trackableRecord.insert({
        id: id,
        user_id: userID,
        trackable_id: trackableId,
        timestamp: dateString,
        time_bucket: timeBucket,
        updated_at: updatedAt,
        value,
        external_key: "",
      });
      return id;
    },
    [dbT, trackableId, dateString, userID, timeBucket],
  );
};

/** Hook to get a record delete handler */
export const useRecordDeleteHandler = () => {
  const { dbT } = usePowersyncDrizzle();
  return useCallback(
    async (recordId: string) => {
      await dbT.trackableRecord.delete(recordId);
    },
    [dbT],
  );
};

export const useTrackableHandlers = () => {
  const { dbT, userID } = usePowersyncDrizzle();

  const deleteTrackable = async (id: string) => {
    await dbT.trackable.delete(id);
  };

  const updateTrackableName = async ({ id, name }: { id: string; name: string }) => {
    await dbT.trackable.update(id, (v) => (v.name = name));
  };

  const createTrackable = async (data: Omit<DbTrackableInsert, "user_id" | "id">) => {
    const id = uuidv4();
    await dbT.trackable.insert({
      ...data,
      bucketing: data.bucketing ?? "day",
      user_id: userID,
      id,
    });
    return id;
  };

  return { deleteTrackable, updateTrackableName, createTrackable };
};
