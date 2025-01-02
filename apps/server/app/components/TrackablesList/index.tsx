import { Fragment, useMemo, useState } from "react";
import { cn } from "@shad/utils";
import { Link } from "@tanstack/react-router";
import { format, isLastDayOfMonth, subDays } from "date-fns";
import { m } from "framer-motion";

import { DbTrackableSelect } from "@tyl/db/schema";
import { mapDataToRange, sortTrackableList } from "@tyl/helpers/trackables";

import { Badge } from "~/@shad/components/badge";
import { Button } from "~/@shad/components/button";
import { Input } from "~/@shad/components/input";
import { Spinner } from "~/@shad/components/spinner";
import DayCellWrapper from "~/components/DayCell";
import TrackableProvider from "~/components/Providers/TrackableProvider";
import { TrackableNameText } from "~/components/TrackableName";
import { generateDates } from "~/components/TrackablesList/helper";
import {
  useZeroGroupSet,
  useZeroTrackableListWithData,
  useZeroTrackablesList,
} from "~/utils/useZ";
import MiniTrackable from "./miniTrackable";

const EmptyList = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="text-2xl font-light">
        You do not have any trackables yet.
      </h2>

      <Link className="mt-4" to={"/app/create"}>
        <Button variant="outline">Create Trackable</Button>
      </Link>
    </div>
  );
};

type TrackableTypeFilterState = Record<DbTrackableSelect["type"], boolean>;

const filterTrackables = <
  T extends Pick<DbTrackableSelect, "id" | "name" | "type">,
>(
  query: string,
  types: TrackableTypeFilterState,
  list: T[],
) => {
  const filterByType = Object.values(types).some((v) => v);

  if (!query && !filterByType) return list;

  return list
    .filter((v) => {
      return (v.name || "").includes(query);
    })
    .filter((v) => {
      if (!filterByType) return true;
      return types[v.type];
    });
};

const TrackablesList = ({ daysToShow }: { daysToShow: number }) => {
  const now = new Date();
  const lastDay = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const firstDay = subDays(lastDay, daysToShow - 1).getTime();

  const [data, info] = useZeroTrackableListWithData({
    firstDay,
    lastDay,
  });

  const [searchQ, setSearch] = useState("");
  const [filterTypes, setFilterTypes] = useState<TrackableTypeFilterState>({
    number: false,
    range: false,
    boolean: false,
  });

  const filtered = useMemo(
    () => filterTrackables(searchQ, filterTypes, data ? [...data] : []),
    [data, filterTypes, searchQ],
  );

  const favsSet = useZeroGroupSet("favorites");

  const sorted = useMemo(
    () => sortTrackableList(filtered, favsSet),
    [filtered, favsSet],
  );

  if (!data || data.length === 0) return <EmptyList />;

  const mappedData = sorted.map((v) => ({
    trackable: v,
    data: mapDataToRange(firstDay, lastDay, v.trackableRecord),
  }));

  return (
    <>
      <Input
        placeholder="Search by name"
        className="mt-2"
        value={searchQ}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="mt-2 flex gap-2">
        {Object.keys(filterTypes).map((v) => (
          <Badge
            key={v}
            variant={
              filterTypes[v as keyof TrackableTypeFilterState]
                ? "default"
                : "outline"
            }
            className="cursor-pointer capitalize"
            onClick={() => {
              setFilterTypes({
                ...filterTypes,
                [v]: !filterTypes[v as keyof TrackableTypeFilterState],
              });
            }}
          >
            {v}
          </Badge>
        ))}
      </div>

      <div className="mt-3 grid gap-5">
        {mappedData.map(({ trackable, data }) => (
          <m.div
            transition={{ duration: 0.2, ease: "circInOut" }}
            layout
            layoutId={trackable.id}
            key={trackable.id}
            className="border-b border-neutral-200 pb-4 last:border-0 dark:border-neutral-800"
          >
            <TrackableProvider trackable={trackable}>
              <MiniTrackable data={data} />
            </TrackableProvider>
          </m.div>
        ))}
      </div>
    </>
  );
};

export const DailyList = ({ daysToShow }: { daysToShow: number }) => {
  const today = new Date();

  const now = new Date();
  const lastDay = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const firstDay = subDays(lastDay, daysToShow).getTime();

  console.log("first day", firstDay);

  const [data, info] = useZeroTrackableListWithData({
    firstDay: firstDay,
    lastDay,
    orderBy: "desc",
  });

  const favsSet = useZeroGroupSet("favorites");

  const sorted = sortTrackableList([...data], favsSet);

  const mappedData = sorted.map((v) => ({
    trackable: v,
    data: mapDataToRange(firstDay, lastDay, v.trackableRecord, "desc"),
  }));

  if (!data || data.length === 0) {
    if (info.type === "unknown") {
      return (
        <div className="flex h-full items-center justify-center py-10">
          <Spinner />
        </div>
      );
    }
    return <EmptyList />;
  }

  const days = mappedData[0]?.data.map((v, i) => v.date) || [];

  const trackables = mappedData.map((_, i) => i) || [];

  return (
    <div className="flex flex-col gap-6">
      {days.map((date, dateIndex) => {
        return (
          <Fragment key={dateIndex}>
            <div className="relative flex h-fit flex-col">
              <div className="flex w-full flex-col justify-between gap-2">
                {(isLastDayOfMonth(date) || dateIndex === 0) && (
                  <div className="mb-2 text-2xl font-semibold lg:text-3xl">
                    {format(date, "MMMM")}
                  </div>
                )}

                <span className="flex w-full items-baseline gap-2">
                  <span className="text-xl opacity-30">
                    {format(date, "EEEE")}
                  </span>{" "}
                  <span className="text-xl font-semibold opacity-80">
                    {format(date, "d")}
                  </span>
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {trackables.map((index) => {
                  const tr = mappedData[index];
                  if (!tr) return null;
                  const day = tr.data[dateIndex];
                  if (!day) return null;

                  return (
                    <div key={index}>
                      <TrackableProvider trackable={tr.trackable}>
                        <Link
                          to={`/app/trackables/${tr.trackable.id}/`}
                          className={cn(
                            "mb-1 block w-full truncate text-xl text-neutral-950 opacity-20 dark:text-neutral-50",
                          )}
                        >
                          <TrackableNameText />
                        </Link>

                        <DayCellWrapper
                          date={day.date}
                          value={day.value}
                          labelType="none"
                          className="h-20"
                        />
                      </TrackableProvider>
                    </div>
                  );
                })}
              </div>
            </div>
            {dateIndex !== days.length - 1 && (
              <hr className="h-0 border-b border-neutral-200 dark:border-neutral-800" />
            )}
          </Fragment>
        );
      })}
    </div>
  );
};

export default TrackablesList;
