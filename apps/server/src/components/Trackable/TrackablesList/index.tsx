import { Fragment } from "react";
import { cn } from "@shad/lib/utils";
import { Link } from "@tanstack/react-router";
import { format, isLastDayOfMonth, subDays } from "date-fns";
import { m } from "motion/react";

import { mapDataToRange } from "@tyl/helpers/trackables";

import { Button } from "~/@shad/components/button";
import DayCellRouter from "~/components/DayCell";
import { TrackableNameText } from "~/components/Trackable/TrackableName";
import { TrackableFlagsProvider } from "~/components/Trackable/TrackableProviders/TrackableFlagsProvider";
import TrackableProvider from "~/components/Trackable/TrackableProviders/TrackableProvider";
import {  useTrackablesList } from "@tyl/helpers/dbHooks";
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

const TrackablesList = ({
  daysToShow,
  archived
}: {
  daysToShow: number;
  archived: boolean;
}) => {
  const now = new Date();
  const lastDay = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const firstDay = subDays(lastDay, daysToShow - 1).getTime();

  const q = useTrackablesList({
    withData: {
      firstDay,
      lastDay,

    },
    showArchived: archived,
  });

  if (q.data.length === 0) return <EmptyList />;

  // Convert TrackableRecordRow[] to DataRecord[] by converting ISO string dates to timestamps
  const mappedData = q.data.map((v) => {
    const dataRecords = v.data.map((record) => ({
      id: record.id,
      value: record.value,
      timestamp: new Date(record.timestamp).getTime(),
      updated_at: record.updated_at,
    }));
    return {
      trackable: v,
      data: mapDataToRange(firstDay, lastDay, dataRecords),
    };
  });

  return (
    <>
      <div className="mt-3 grid gap-5">
        <TrackableFlagsProvider>
          {mappedData.map(({ trackable, data }) => (
            <m.div
              transition={{ duration: 0.2, ease: "circInOut" }}
              layout
              layoutId={trackable.id}
              key={trackable.id}
              className="border-border border-b pb-4 last:border-0"
            >
              <TrackableProvider trackable={trackable}>
                <MiniTrackable data={data} trackable={trackable} />
              </TrackableProvider>
            </m.div>
          ))}
        </TrackableFlagsProvider>
      </div>
    </>
  );
};

export const DailyList = ({ daysToShow }: { daysToShow: number }) => {
  const now = new Date();
  const lastDay = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const firstDay = subDays(lastDay, daysToShow).getTime();

  const q = useTrackablesList({
    withData: {
      firstDay,
      lastDay,
    },
  });

  if (q.data.length === 0) {
    return <EmptyList />;
  }

  // Convert TrackableRecordRow[] to DataRecord[] by converting ISO string dates to timestamps
  const mappedData = q.data.map((v) => {
    const dataRecords = v.data.map((record) => ({
      id: record.id,
      value: record.value,
      timestamp: new Date(record.timestamp).getTime(),
      updated_at: record.updated_at,
    }));
    return {
      trackable: v,
      data: mapDataToRange(firstDay, lastDay, dataRecords, "desc"),
    };
  });

  const days = mappedData[0]?.data.map((v) => v.timestamp) ?? [];

  const trackables = mappedData.map((_, i) => i);

  return (
    <div className="flex flex-col gap-6">
      <TrackableFlagsProvider>
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
                      <div className="" key={index}>
                        <TrackableProvider trackable={tr.trackable}>
                          <Link
                            to={"/app/trackables/$id/view"}
                            params={{ id: tr.trackable.id }}
                            className={cn(
                              "text-foreground mb-1 block w-full truncate text-xl opacity-20",
                            )}
                          >
                            <TrackableNameText trackable={tr.trackable} />
                          </Link>

                          <DayCellRouter
                            {...day}
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
                <hr className="border-border h-0 border-b" />
              )}
            </Fragment>
          );
        })}
      </TrackableFlagsProvider>
    </div>
  );
};

export default TrackablesList;
