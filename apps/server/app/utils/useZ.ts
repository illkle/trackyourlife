import { useQuery, useZero } from "@rocicorp/zero/react";
import { addMonths, addYears, subMonths } from "date-fns";

import { Schema } from "~/schema";

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
  const q = zero.query.TYL_trackable;
  return useQuery(q);
};

export const useZeroTrackableListWithData = (params: TrackableRangeParams) => {
  const zero = useZ();

  const q = zero.query.TYL_trackable.related("trackableRecord", (q) =>
    q
      .where(({ cmp, and }) =>
        and(
          cmp("date", ">=", params.firstDay),
          cmp("date", "<=", params.lastDay),
        ),
      )
      .orderBy("date", params.orderBy || "asc"),
  );
  return useQuery(q);
};

export const useZeroTrackable = ({ id }: { id: string }) => {
  const zero = useZ();
  const q = zero.query.TYL_trackable.one().where("id", id);

  return useQuery(q);
};

interface ByIdParams extends TrackableRangeParams {
  id: string;
}
const trackableQuery = (params: ByIdParams) => {
  const zero = useZ();

  return zero.query.TYL_trackableRecord.where(({ cmp, and }) =>
    and(
      cmp("trackableId", params.id),
      cmp("date", ">=", params.firstDay),
      cmp("date", "<=", params.lastDay),
    ),
  ).orderBy("date", params.orderBy || "asc");
};

export const useZeroTrackableData = ({ id, firstDay, lastDay }: ByIdParams) => {
  return useQuery(trackableQuery({ id, firstDay, lastDay }));
};

export const preloadZeroTrackableData = async ({
  id,
  firstDay,
  lastDay,
}: ByIdParams) => {
  trackableQuery({ id, firstDay, lastDay }).preload();
};

export const preloadTrackableMonthView = async ({
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

export const preloadTrackableYearView = async ({
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

export const preloadCore = async () => {
  const zero = useZ();

  const now = new Date();

  zero.query.TYL_trackable.related("trackableRecord", (q) =>
    q
      .where("date", ">=", subMonths(now, 2).getTime())
      .where("date", "<=", addMonths(now, 2).getTime()),
  ).preload();
};
