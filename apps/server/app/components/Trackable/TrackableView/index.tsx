import { Fragment } from "react/jsx-runtime";
import { cn } from "@shad/utils";
import {
  eachMonthOfInterval,
  endOfMonth,
  endOfYear,
  format,
  getISODay,
  isToday,
  startOfMonth,
  startOfYear,
} from "date-fns";

import type { PureDataRecord } from "@tyl/helpers/trackables";
import { mapDataToRange } from "@tyl/helpers/trackables";

import type { ITrackableFlagType } from "~/components/Trackable/TrackableProviders/trackableFlags";
import { Button } from "~/@shad/components/button";
import DayCellRouter from "~/components/DayCell";
import { TrackableNoteEditable } from "~/components/Trackable/TrackableNote";
import { useTrackableFlags } from "~/components/Trackable/TrackableProviders/TrackableFlagsProvider";
import { useTrackableMeta } from "~/components/Trackable/TrackableProviders/TrackableProvider";
import { ViewController } from "~/components/Trackable/TrackableView/viewController";
import { useZeroTrackableData } from "~/utils/useZ";

const MonthVisualCalendar = ({
  data,
  mini,
}: {
  data: PureDataRecord[];
  mini?: boolean;
}) => {
  const prefaceWith = data[0] ? getISODay(data[0].date) - 1 : 0;

  return (
    <div
      className={cn(
        "grid grid-cols-7 gap-1",
        mini
          ? "auto-rows-[48px]"
          : "auto-rows-[48px] sm:auto-rows-[56px] md:auto-rows-[64px]",
      )}
    >
      <div style={{ gridColumn: `span ${prefaceWith}` }}></div>
      {data.map((el, i) => {
        return (
          <DayCellRouter
            key={i}
            {...el}
            labelType={mini ? "outside" : "auto"}
          />
        );
      })}
    </div>
  );
};

const MonthVisualList = ({ data }: { data: PureDataRecord[] }) => {
  return (
    <div
      className={cn("grid auto-rows-[64px] grid-cols-[max-content_1fr] gap-3")}
    >
      {data.map((el, i) => {
        return (
          <Fragment key={i}>
            <h5
              className={cn(
                "-translate-y-0.5 font-mono text-3xl leading-[100%] font-extralight select-none",
                isToday(el.date)
                  ? "text-neutral-950 dark:text-neutral-100"
                  : "text-neutral-700 dark:text-neutral-600",
              )}
            >
              {format(el.date, "dd")}
            </h5>
            <DayCellRouter key={i} {...el} labelType={"none"} />
          </Fragment>
        );
      })}
    </div>
  );
};

export const MonthFetcher = ({
  date,
  mini,
  forceViewType,
}: {
  date: Date;
  mini?: boolean;
  forceViewType?: ITrackableFlagType<"AnyMonthViewType">;
}) => {
  const { id } = useTrackableMeta();
  const { getFlag } = useTrackableFlags();
  const viewType = forceViewType ?? getFlag(id, "AnyMonthViewType");
  const firstDayDate = startOfMonth(date).getTime();
  const lastDayDate = endOfMonth(date).getTime();

  const [data] = useZeroTrackableData({
    id,
    firstDay: firstDayDate,
    lastDay: lastDayDate,
  });

  const mappedData = mapDataToRange(firstDayDate, lastDayDate, data);

  if (viewType === "list") {
    return (
      <div key={`${firstDayDate}-${lastDayDate}`}>
        <MonthVisualList data={mappedData} />
      </div>
    );
  }

  return (
    <div key={`${firstDayDate}-${lastDayDate}`}>
      <MonthVisualCalendar data={mappedData} mini={mini} />
    </div>
  );
};

const YearFetcher = ({
  date,
  openMonth,
}: {
  date: Date;
  openMonth: (n: number) => void;
}) => {
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

            <MonthFetcher mini={true} date={el} />
          </div>
        );
      })}
    </div>
  );
};

export type TVDateValue = number | "list";

const TrackableView = ({
  year,
  month,
  setDates,
}: {
  year: TVDateValue;
  month: TVDateValue;
  setDates: (year: TVDateValue, month: TVDateValue) => void;
}) => {
  const view =
    typeof month !== "number" && typeof year === "number" ? "months" : "days";

  const openMonth = (m: number) => {
    setDates(year, m);
  };

  return (
    <>
      <ViewController year={year} month={month} />

      {view === "days" && (
        <MonthFetcher date={new Date(year as number, month as number, 1)} />
      )}
      {view === "months" && (
        <YearFetcher
          date={new Date(year as number, 0, 1)}
          openMonth={openMonth}
        />
      )}

      <hr className="my-4 h-[1px] border-none bg-neutral-900 opacity-10 outline-hidden dark:bg-neutral-50" />

      <TrackableNoteEditable />
    </>
  );
};

export default TrackableView;
