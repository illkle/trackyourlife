import { Fragment } from "react/jsx-runtime";
import { cn } from "@shad/lib/utils";
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  endOfYear,
  format,
  getISODay,
  isToday,
  startOfMonth,
  startOfYear,
} from "date-fns";

import type { ITrackableFlagType } from "@tyl/helpers/data/trackableFlags";
import { Button } from "~/@shad/components/button";
import DayCellRouter from "~/components/DayCell";
import { useTrackableMeta } from "@tyl/helpers/data/TrackableMetaProvider";
import { useMemo } from "react";
import { useTrackableFlag } from "@tyl/helpers/data/dbHooksTanstack";

const MonthVisualCalendar = ({ dateFirstDay, mini }: { dateFirstDay: Date; mini?: boolean }) => {
  const prefaceWith = dateFirstDay ? getISODay(dateFirstDay) - 1 : 0;

  const days = useMemo(
    () => eachDayOfInterval({ start: dateFirstDay, end: endOfMonth(dateFirstDay) }),
    [dateFirstDay],
  );

  return (
    <div
      className={cn(
        "grid grid-cols-7 gap-1",
        mini ? "auto-rows-[48px]" : "auto-rows-[48px] sm:auto-rows-[56px] md:auto-rows-[64px]",
      )}
    >
      <div style={{ gridColumn: `span ${prefaceWith}` }}></div>
      {days.map((el, i) => (
        <DayCellRouter key={i} timestamp={el} labelType={mini ? "outside" : "auto"} />
      ))}
    </div>
  );
};

const MonthVisualList = ({ dateFirstDay }: { dateFirstDay: Date }) => {
  const days = eachDayOfInterval({
    start: dateFirstDay,
    end: endOfMonth(dateFirstDay),
  });

  return (
    <div className={cn("grid auto-rows-[64px] grid-cols-[max-content_1fr] gap-3")}>
      {days.map((el, i) => {
        return (
          <Fragment key={i}>
            <h5
              className={cn(
                "-translate-y-0.5 font-mono text-3xl leading-[100%] font-extralight select-none",
                isToday(el) ? "text-foreground" : "text-muted-foreground/40",
              )}
            >
              {format(el, "dd")}
            </h5>
            <DayCellRouter key={i} timestamp={el} labelType={"none"} />
          </Fragment>
        );
      })}
    </div>
  );
};

export const MonthView = ({
  date,
  mini,
  forceViewType,
}: {
  date: Date;
  mini?: boolean;
  forceViewType?: ITrackableFlagType<"AnyMonthViewType">;
}) => {
  const { id } = useTrackableMeta();

  const { data: vt } = useTrackableFlag(id, "AnyMonthViewType");
  const viewType = forceViewType ?? vt;
  const firstDayDate = useMemo(() => startOfMonth(date), [date]);
  const lastDayDate = useMemo(() => endOfMonth(date), [date]);

  return (
    <div key={`${firstDayDate}-${lastDayDate}`}>
      {viewType === "list" ? (
        <MonthVisualList dateFirstDay={firstDayDate} />
      ) : (
        <MonthVisualCalendar dateFirstDay={firstDayDate} mini={mini} />
      )}
    </div>
  );
};

export const YearView = ({ date, openMonth }: { date: Date; openMonth: (n: number) => void }) => {
  const firstDayDate = startOfYear(date);
  const lastDayDate = endOfYear(firstDayDate);

  const months = eachMonthOfInterval({
    start: firstDayDate,
    end: lastDayDate,
  });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {months.map((el, i) => {
        return (
          <div key={i}>
            <Button
              onClick={() => openMonth(i)}
              variant="link"
              className="w-full justify-start text-lg"
            >
              {format(el, "MMMM")}
            </Button>

            <MonthView mini={true} date={el} />
          </div>
        );
      })}
    </div>
  );
};

export type TVDateValue = number | "list";
