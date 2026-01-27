import { Fragment, useMemo } from "react";
import { Spinner } from "@shad/components/spinner";
import { cn } from "@shad/lib/utils";
import { Link } from "@tanstack/react-router";
import { eachDayOfInterval, format, isLastDayOfMonth, subDays } from "date-fns";
import { m, Transition } from "motion/react";

import { useTrackablesList } from "@tyl/helpers/data/dbHooks";

import { Button } from "~/@shad/components/button";
import DayCellRouter from "~/components/DayCell";
import { QueryError } from "~/components/QueryError";
import { TrackableNameText } from "~/components/Trackable/TrackableName";
import { TrackableFlagsProviderExternal } from "@tyl/helpers/data/TrackableFlagsProvider";
import MiniTrackable from "./miniTrackable";
import { TrackableDataProvider } from "@tyl/helpers/data/TrackableDataProvider";
import { TrackableGroupsProvider } from "@tyl/helpers/data/TrackableGroupsProvider";
import { TrackableMetaProvider } from "@tyl/helpers/data/TrackableMetaProvider";

const EmptyList = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="text-2xl font-light">You do not have any trackables yet.</h2>

      <Link className="mt-4" to={"/app/create"}>
        <Button variant="outline">Create Trackable</Button>
      </Link>
    </div>
  );
};

const list_transition: Transition = { duration: 0.2, ease: "circInOut" };

const TrackablesList = ({ daysToShow, archived }: { daysToShow: number; archived: boolean }) => {
  const range = useMemo(() => {
    const lastDay = new Date();
    return {
      firstDay: subDays(lastDay, daysToShow - 1),
      lastDay,
    };
  }, [daysToShow]);

  const q = useTrackablesList({
    withData: range,
    showArchived: archived,
  });

  if (q.isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (q.error) {
    return <QueryError error={q.error} onRetry={q.refresh} />;
  }

  if (q.data.length === 0) return <EmptyList />;

  return (
    <>
      <div className="mt-3 grid gap-5">
        <TrackableDataProvider trackablesSelect={q.data}>
          <TrackableGroupsProvider trackablesSelect={q.data}>
            <TrackableFlagsProviderExternal trackablesSelect={q.data}>
              {q.data.map((trackable) => (
                <m.div
                  transition={list_transition}
                  layout
                  layoutId={trackable.id}
                  key={trackable.id}
                  className="border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <TrackableMetaProvider trackable={trackable}>
                    <MiniTrackable firstDay={range.firstDay} lastDay={range.lastDay} />
                  </TrackableMetaProvider>
                </m.div>
              ))}
            </TrackableFlagsProviderExternal>
          </TrackableGroupsProvider>
        </TrackableDataProvider>
      </div>
    </>
  );
};

export const DailyList = ({ daysToShow }: { daysToShow: number }) => {
  const range = useMemo(() => {
    const lastDay = new Date();
    return {
      firstDay: subDays(lastDay, daysToShow),
      lastDay,
    };
  }, [daysToShow]);

  const q = useTrackablesList({
    withData: range,
  });

  const days = eachDayOfInterval({
    start: range.lastDay,
    end: range.firstDay,
  });

  if (q.isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (q.error) {
    return <QueryError error={q.error} onRetry={q.refresh} />;
  }

  if (q.data.length === 0) {
    return <EmptyList />;
  }

  return (
    <div className="flex flex-col gap-6">
      <TrackableFlagsProviderExternal trackablesSelect={q.data}>
        <TrackableDataProvider trackablesSelect={q.data}>
          <TrackableGroupsProvider trackablesSelect={q.data}>
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
                        <span className="text-xl opacity-30">{format(date, "EEEE")}</span>{" "}
                        <span className="text-xl font-semibold opacity-80">
                          {format(date, "d")}
                        </span>
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {q.data.map((trackable) => {
                        return (
                          <div className="" key={trackable.id}>
                            <TrackableMetaProvider trackable={trackable}>
                              <Link
                                to={"/app/trackables/$id/view"}
                                params={{ id: trackable.id }}
                                className={cn(
                                  "mb-1 block w-full truncate text-xl text-foreground opacity-20",
                                )}
                              >
                                <TrackableNameText />
                              </Link>

                              <DayCellRouter timestamp={date} labelType="none" className="h-20" />
                            </TrackableMetaProvider>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {dateIndex !== days.length - 1 && <hr className="h-0 border-b border-border" />}
                </Fragment>
              );
            })}
          </TrackableGroupsProvider>
        </TrackableDataProvider>
      </TrackableFlagsProviderExternal>
    </div>
  );
};

export default TrackablesList;
