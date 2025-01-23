import { useEffect } from "react";
import { cn } from "@shad/utils";
import { Link } from "@tanstack/react-router";
import {
  eachMonthOfInterval,
  endOfMonth,
  endOfYear,
  format,
  getISODay,
  startOfMonth,
  startOfYear,
} from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import type { PureDataRecord } from "@tyl/helpers/trackables";
import { mapDataToRange } from "@tyl/helpers/trackables";

import { Button } from "~/@shad/components/button";
import { useTrackableMeta } from "~/components/Providers/TrackableProvider";
import { TrackableNoteEditable } from "~/components/TrackableNote";
import { YearSelector } from "~/components/TrackableView/yearSelector";
import { Route } from "~/routes/app/trackables/$id/view";
import { useZeroTrackableData } from "~/utils/useZ";
import DayCellRouter from "../DayCell";

const TextMonthEditor = ({
  data,
  prefaceDays,
  mini,
}: {
  data: PureDataRecord[];
  prefaceDays: number;
  mini?: boolean;
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div style={{ gridColumn: `span ${prefaceDays}` }}></div>

        {data.map((el, i) => {
          return <DayCellRouter key={i} {...el} />;
        })}
      </div>
    </div>
  );
};

const MonthVisualCalendar = ({
  data,
  prefaceDays,
  mini,
}: {
  data: PureDataRecord[];
  prefaceDays: number;
  mini?: boolean;
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-7 gap-1",
        mini
          ? "auto-rows-[48px]"
          : "auto-rows-[48px] sm:auto-rows-[56px] md:auto-rows-[64px]",
      )}
    >
      <div style={{ gridColumn: `span ${prefaceDays}` }}></div>

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

export const MonthFetcher = ({
  date,
  mini,
}: {
  date: Date;
  mini?: boolean;
}) => {
  const { id } = useTrackableMeta();

  const firstDayDate = startOfMonth(date).getTime();
  const lastDayDate = endOfMonth(date).getTime();
  const prefaceWith = getISODay(firstDayDate) - 1;

  const [data, s] = useZeroTrackableData({
    id,
    firstDay: firstDayDate,
    lastDay: lastDayDate,
  });

  const mappedData = mapDataToRange(firstDayDate, lastDayDate, data);

  return (
    <div key={`${firstDayDate}-${lastDayDate}`}>
      <MonthVisualCalendar
        data={mappedData}
        prefaceDays={prefaceWith}
        mini={mini}
      />
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

const getIncrementedDate = (
  add: number,
  year: TVDateValue,
  month: TVDateValue,
) => {
  if (month === "list" && year !== "list") {
    return { year: year + add, month: month };
  }

  if (month === "list" || year === "list") {
    return { year, month };
  }

  let newMonth = month + add;
  let newYear = year;
  if (newMonth < 0) {
    newMonth = 11;
    newYear = year - 1;
  }

  if (newMonth > 11) {
    newMonth = 0;
    newYear = year + 1;
  }
  return { year: newYear, month: newMonth };
};

export const ViewController = ({
  year,

  month,
}: {
  year: TVDateValue;
  month: TVDateValue;
}) => {
  const now = new Date();
  const navigate = Route.useNavigate();

  const toPrev = getIncrementedDate(-1, year, month);
  const toNext = getIncrementedDate(1, year, month);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.metaKey) {
        if (e.key === "ArrowLeft") {
          void navigate({ search: (prev) => ({ ...prev, ...toPrev }) });
        } else if (e.key === "ArrowRight") {
          void navigate({ search: (prev) => ({ ...prev, ...toNext }) });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, toPrev, toNext]);

  return (
    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div className="flex items-baseline gap-2 self-center">
        <YearSelector
          value={typeof year === "number" ? year : undefined}
          onChange={(v) =>
            navigate({ search: (prev) => ({ ...prev, year: v }) })
          }
        />

        {typeof year === "number" && typeof month === "number" && (
          <>
            <div className="pl-4 text-xl font-light text-neutral-200 dark:text-neutral-800">
              /
            </div>
            <Link
              from={Route.fullPath}
              search={(prev) => ({
                ...prev,
                month: "list",
              })}
            >
              <Button name="months" variant="ghost">
                {format(new Date(year, month, 1), "MMMM")}
              </Button>
            </Link>
          </>
        )}
      </div>
      <div className="flex w-fit gap-2 self-end">
        <Button
          aria-label="Previous month"
          variant="outline"
          size="icon"
          asChild
        >
          <Link
            from={Route.fullPath}
            search={(prev) => ({ ...prev, ...toPrev })}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Link>
        </Button>

        <Button aria-label="Next month" variant="outline" size="icon" asChild>
          <Link
            from={Route.fullPath}
            search={(prev) => ({ ...prev, ...toNext })}
          >
            <ChevronRightIcon className="h-4 w-4" />{" "}
          </Link>
        </Button>

        <Button aria-label="Current month" variant="outline" asChild>
          <Link
            from={Route.fullPath}
            search={(prev) => ({
              ...prev,
              month: now.getMonth(),
              year: now.getFullYear(),
            })}
            activeProps={{
              className: "pointer-events-none opacity-50",
            }}
          >
            Today
          </Link>
        </Button>
      </div>
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
