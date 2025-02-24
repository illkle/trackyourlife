/* eslint-disable @typescript-eslint/unbound-method */
import type { Row } from "@rocicorp/zero";
import { useCallback, useMemo } from "react";
import { useQuery, useZero } from "@rocicorp/zero/react";
import {
  addMonths,
  addYears,
  endOfDay,
  isSameDay,
  startOfDay,
  subMonths,
} from "date-fns";
import { v4 as uuidv4 } from "uuid";

import type { RecordAttribute } from "@tyl/helpers/trackables";
import { convertDateFromLocalToDb } from "@tyl/helpers/trackables";

import type { Schema } from "~/schema";

export const useZ = () => {
  return useZero<Schema>();
};

interface TrackableRangeParams {
  firstDay: number;
  lastDay: number;
}

export const useZeroTrackablesList = () => {
  const zero = useZ();
  const q = zero.query.TYL_trackable.orderBy("name", "asc").related(
    "trackableGroup",
  );
  /*
  This query is bugged, waiting for fix from Rocicorp
    .where(({ not, exists }) =>
      not(exists("trackableGroup", (q) => q.where("group", "=", "archived"))),
    )
  */

  return useQuery(q);
};

export type TrackableListItem = Row<Schema["tables"]["TYL_trackable"]> & {
  trackableGroup: readonly Row<Schema["tables"]["TYL_trackableGroup"]>[];
};

export const useZeroTrackableListWithData = (params: TrackableRangeParams) => {
  const zero = useZ();

  // WAITING TODO: add `not exists` for archived when zero fixes it
  const q = zero.query.TYL_trackable.orderBy("name", "asc")
    .related("trackableRecord", (q) =>
      q
        .where(({ cmp, and }) =>
          and(
            cmp(
              "date",
              ">=",
              convertDateFromLocalToDb(startOfDay(params.firstDay)),
            ),
            cmp(
              "date",
              "<=",
              convertDateFromLocalToDb(endOfDay(params.lastDay)),
            ),
          ),
        )
        .orderBy("date", "asc")
        .orderBy("createdAt", "asc")
        .related("trackableRecordAttributes"),
    )
    .related("trackableGroup");

  return useQuery(q);
};

export const useZeroTrackable = ({ id }: { id: string }) => {
  const zero = useZ();
  const q = zero.query.TYL_trackable.one()
    .where("id", id)
    .related("trackableGroup");

  return useQuery(q);
};

interface ByIdParams extends TrackableRangeParams {
  id: string;
}
const useTrackableQuery = (params: ByIdParams) => {
  const zero = useZ();

  return zero.query.TYL_trackableRecord.where(({ cmp, and }) =>
    and(
      cmp("trackableId", params.id),
      cmp("date", ">=", convertDateFromLocalToDb(startOfDay(params.firstDay))),
      cmp("date", "<=", convertDateFromLocalToDb(endOfDay(params.lastDay))),
    ),
  )
    .orderBy("date", "asc")
    .orderBy("createdAt", "asc")
    .related("trackableRecordAttributes");
};

export const useZeroTrackableData = ({ id, firstDay, lastDay }: ByIdParams) => {
  return useQuery(useTrackableQuery({ id, firstDay, lastDay }));
};

export const usePreloadZeroTrackableData = ({
  id,
  firstDay,
  lastDay,
}: ByIdParams) => {
  useTrackableQuery({ id, firstDay, lastDay }).preload();
};

export const usePreloadTrackableMonthView = ({
  id,
  year,
}: {
  id: string;
  year: number;
}) => {
  const zero = useZ();

  const now = Date.UTC(year, 0, 1);

  zero.query.TYL_trackableRecord.where("trackableId", id)
    .where("date", ">=", addMonths(now, -3).getTime())
    .where("date", "<=", addMonths(now, 15).getTime())
    .related("trackableRecordAttributes")
    .preload();
};

export const usePreloadTrackableYearView = ({
  id,
  year,
}: {
  id: string;
  year: number;
}) => {
  const zero = useZ();

  const now = Date.UTC(year, 0, 1);

  zero.query.TYL_trackableRecord.where("trackableId", id)
    .where("date", ">=", addYears(now, -2).getTime())
    .where("date", "<=", addYears(now, 2).getTime())
    .related("trackableRecordAttributes")
    .preload();
};

export const usePreloadCore = () => {
  const zero = useZ();

  const now = new Date();

  zero.query.TYL_trackable.related("trackableRecord", (q) =>
    q
      .where("date", ">=", subMonths(now, 3).getTime())
      .related("trackableRecordAttributes"),
  )
    .related("trackableGroup")
    .related("trackableFlag")
    .preload();

  zero.query.TYL_userFlags.where("userId", zero.userID).preload();
};

export const useZeroGroupList = (group: string) => {
  const zero = useZ();
  const q = zero.query.TYL_trackableGroup.where("group", "=", group);
  return useQuery(q);
};

export const useZeroGroupSet = (group: string) => {
  const [data] = useZeroGroupList(group);

  return useMemo(() => {
    return new Set<string>(data.map((f) => f.trackableId));
  }, [data]);
};

export const useZeroInGroup = (trackableId: string, group: string) => {
  const z = useZ();
  const q = z.query.TYL_trackableGroup.where(({ cmp, and }) =>
    and(
      cmp("trackableId", "=", trackableId),
      cmp("group", "=", group),
      cmp("user_id", "=", z.userID),
    ),
  ).limit(1);
  return useQuery(q);
};

const generateDateTime = (date: Date, storeTime?: boolean) => {
  if (storeTime) {
    const d = new Date();

    if (isSameDay(date, d)) {
      return Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        d.getHours(),
        d.getMinutes(),
        d.getSeconds(),
      );
    }

    return Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
    );
  }

  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
};

export const updateValueRaw = async (
  z: ReturnType<typeof useZ>,
  trackableId: string,
  date: Date,
  type: string,
  val: string,
  recordId?: string,
  timestamp?: number,
) => {
  const d = generateDateTime(date, type === "logs");

  const rid = recordId ?? uuidv4();

  await z.mutate.TYL_trackableRecord.upsert({
    recordId: rid,
    date: d,
    trackableId,
    value: val,
    user_id: z.userID,
    createdAt: timestamp ?? Date.now(),
  });
  return rid;
};
export const useRecordUpdateHandler = ({
  date,
  id,
  type,
}: {
  date: Date;
  id: string;
  type: string;
}) => {
  const z = useZ();

  return useCallback(
    async (val: string, recordId?: string, timestamp?: number) => {
      return await updateValueRaw(z, id, date, type, val, recordId, timestamp);
    },
    [date, id, z, type],
  );
};

export const updateAttributesRaw = async (
  z: ReturnType<typeof useZ>,
  trackableId: string,
  recordId: string,
  attributes: readonly RecordAttribute[],
) => {
  const promises = attributes.map((a) =>
    z.mutate.TYL_trackableRecordAttributes.upsert({
      recordId: recordId,
      trackableId: trackableId,
      key: a.key,
      value: a.value,
      type: a.type,
      user_id: z.userID,
    }),
  );

  await Promise.allSettled(promises);
};

export const useAttrbutesUpdateHandler = ({
  trackableId,
}: {
  trackableId: string;
}) => {
  const z = useZ();

  return useCallback(
    async (recordId: string, attributes: readonly RecordAttribute[]) => {
      return await updateAttributesRaw(z, trackableId, recordId, attributes);
    },
    [trackableId, z],
  );
};

export const useRecordDeleteHandler = () => {
  const z = useZ();

  return useCallback(
    async (recordId: string) => {
      await z.mutate.TYL_trackableRecord.delete({
        recordId: recordId,
      });
    },
    [z],
  );
};

export const useTrackableDay = ({
  date,
  trackableId,
}: {
  date: Date;
  trackableId: string;
}) => {
  const zero = useZ();

  const q = zero.query.TYL_trackable.where("id", "=", trackableId)
    .one()
    .related("trackableRecord", (q) =>
      q
        .where(({ cmp, and }) =>
          and(
            cmp("date", ">=", convertDateFromLocalToDb(startOfDay(date))),
            cmp("date", "<=", convertDateFromLocalToDb(endOfDay(date))),
          ),
        )
        .orderBy("date", "asc")
        .orderBy("value", "asc")
        .orderBy("createdAt", "asc")
        .related("trackableRecordAttributes"),
    );

  return useQuery(q);
};
