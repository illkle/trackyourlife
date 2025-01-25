/* eslint-disable @typescript-eslint/unbound-method */
import type { Row } from "@rocicorp/zero";
import { useCallback, useMemo } from "react";
import { useQuery, useZero } from "@rocicorp/zero/react";
import { addMonths, addYears, subMonths } from "date-fns";
import { v4 as uuidv4 } from "uuid";

import type { Schema } from "~/schema";
import { useTrackableMeta } from "~/components/TrackableProviders/TrackableProvider";

export const useZ = () => {
  return useZero<Schema>();
};

interface TrackableRangeBase {
  orderBy?: "asc" | "desc";
}

interface TrackableRangeParams extends TrackableRangeBase {
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

  // WAITING TODO: add not extest for acrchived when zero fixes it
  const q = zero.query.TYL_trackable.orderBy("name", "asc")
    .related("trackableRecord", (q) =>
      q
        .where(({ cmp, and }) =>
          and(
            cmp("date", ">=", params.firstDay),
            cmp("date", "<=", params.lastDay),
          ),
        )
        .orderBy("date", params.orderBy ?? "asc"),
    )
    .related("trackableGroup");

  return useQuery(q);
};

export const useZeroTrackable = ({ id }: { id: string }) => {
  const zero = useZ();
  const q = zero.query.TYL_trackable.one()
    .where("id", id)
    .related("trackableGroup")
    .related("trackableFlag");

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
      cmp("date", ">=", params.firstDay),
      cmp("date", "<=", params.lastDay),
    ),
  ).orderBy("date", params.orderBy ?? "asc");
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
    .preload();
};

export const usePreloadCore = () => {
  const zero = useZ();

  const now = new Date();

  zero.query.TYL_trackable.related("trackableRecord", (q) =>
    q
      .where("date", ">=", subMonths(now, 2).getTime())
      .where("date", "<=", addMonths(now, 2).getTime()),
  )
    .related("trackableGroup")
    .preload();

  zero.query.TYL_userFlags.where("userId", zero.userID).preload();
  zero.query.TYL_trackableFlags.preload();
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

export const useRecordUpdateHandler = (date: Date, recordId?: string) => {
  const { id } = useTrackableMeta();

  const z = useZ();

  return useCallback(
    async (val: string, timestamp?: number) => {
      const d = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

      await z.mutate.TYL_trackableRecord.upsert({
        recordId: recordId ?? uuidv4(),
        date: d,
        trackableId: id,
        value: val,
        user_id: z.userID,
        createdAt: timestamp,
      });
    },
    [date, id, z, recordId],
  );
};
