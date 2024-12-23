import { useQuery, useZero } from "@rocicorp/zero/react";
import { addMonths, addYears } from "date-fns";

import { Schema } from "~/schema";

export const useZ = () => {
  return useZero<Schema>();
};

export const useZeroTrackablesList = () => {
  const zero = useZ();
  const q = zero.query.TYL_trackable;
  return useQuery(q);
};

export const useZeroTrackable = ({ id }: { id: string }) => {
  const zero = useZ();
  const q = zero.query.TYL_trackable.one().where("id", id);

  return useQuery(q);
};

export const useZeroTrackableData = ({
  id,
  firstDay,
  lastDay,
}: {
  id: string;
  firstDay: Date;
  lastDay: Date;
}) => {
  const zero = useZ();

  const q = zero.query.TYL_trackableRecord.where(({ cmp, and }) =>
    and(
      cmp("trackableId", id),
      cmp("date", ">=", firstDay.getTime()),
      cmp("date", "<=", lastDay.getTime()),
    ),
  );

  return useQuery(q);
};

export const preloadTrackableMonthView = async ({
  id,
  year,
}: {
  id: string;
  year: number;
}) => {
  const zero = useZ();

  const now = new Date(year, 0, 1);

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

  const now = new Date(year, 0, 1);

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
      .where("date", ">=", addMonths(now, -1).getTime())
      .where("date", "<=", addMonths(now, 1).getTime()),
  ).preload();
};
