import { cn } from "@shad/utils";
import {
  eachMonthOfInterval,
  endOfMonth,
  endOfYear,
  format,
  getISODay,
  startOfMonth,
  startOfYear,
} from "date-fns";

import type { PureDataRecord } from "@tyl/helpers/trackables";
import { mapDataToRange } from "@tyl/helpers/trackables";

import { Button } from "~/@shad/components/button";
import { TrackableNoteEditable } from "~/components/TrackableNote";
import { useTrackableFlags } from "~/components/TrackableProviders/TrackableFlagsProvider";
import { useTrackableMeta } from "~/components/TrackableProviders/TrackableProvider";
import { ViewController } from "~/components/TrackableView/viewController";
import { useZeroTrackableData } from "~/utils/useZ";
import DayCellRouter from "../DayCell";

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

const MonthVisualList = ({
  data,
  mini,
}: {
  data: PureDataRecord[];
  mini?: boolean;
}) => {
  const prefaceWith = data[0] ? getISODay(data[0].date) - 1 : 0;

  return (
    <div className={cn("grid grid-cols-[min-content_1fr] gap-4")}>
      {data.map((el, i) => {
        return (
          <>
            <div className="text-3xl font-extralight opacity-30">
              {format(el.date, "dd")}
            </div>
            <DayCellRouter
              key={i}
              {...el}
              labelType={mini ? "outside" : "auto"}
            />{" "}
          </>
        );
      })}
    </div>
  );
};

export const MonthFetcher = ({
  date,
  mini,
}: {
  date: Date;
  mini?: boolean;
}) => {
  const { id } = useTrackableMeta();
  const { getFlag } = useTrackableFlags();
  const flag = getFlag(id, "AnyMonthViewType");
  const firstDayDate = startOfMonth(date).getTime();
  const lastDayDate = endOfMonth(date).getTime();

  const [data] = useZeroTrackableData({
    id,
    firstDay: firstDayDate,
    lastDay: lastDayDate,
  });

  const mappedData = mapDataToRange(firstDayDate, lastDayDate, data);

  return (
    <div key={`${firstDayDate}-${lastDayDate}`}>
      <MonthVisualList data={mappedData} mini={mini} />
    </div>
  );

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

      <hr className="my-4 h-[1px] border-none bg-neutral-900 opacity-10 outline-none dark:bg-neutral-50" />

      <TrackableNoteEditable />
    </>
  );
};

export default TrackableView;
