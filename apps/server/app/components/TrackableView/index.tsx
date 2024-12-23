import { cn } from "@shad/utils";
import { Link } from "@tanstack/react-router";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfYear,
  format,
  getISODay,
  getMonth,
  getYear,
  isSameDay,
  startOfYear,
} from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

import { mapDataToRange, PureDataRecord } from "@tyl/helpers/trackables";

import { Button } from "~/@shad/components/button";
import { useTrackableMeta } from "~/components/Providers/TrackableProvider";
import { TrackableNoteEditable } from "~/components/TrackableNote";
import { YearSelector } from "~/components/TrackableView/yearSelector";
import { Route } from "~/routes/app/trackables/$id/view";
import {
  preloadZeroTrackableData,
  useZ,
  useZeroTrackableData,
} from "~/utils/useZ";
import DayCellWrapper from "../DayCell";

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
    <>
      <div className={cn("grid gap-1", mini ? "grid-cols-7" : "grid-cols-7")}>
        <div style={{ gridColumn: `span ${prefaceDays}` }}></div>

        {data.map((el, i) => {
          return (
            <DayCellWrapper
              key={`${el.date.getTime()}`}
              disabled={el.disabled}
              value={el.value}
              date={el.date}
              labelType={mini ? "outside" : "auto"}
              className={mini ? "h-12" : "h-12 sm:h-14 md:h-16"}
            />
          );
        })}
      </div>
    </>
  );
};

const MonthFetcher = ({
  month,
  year,
  mini,
}: {
  month: number;
  year: number;
  mini?: boolean;
}) => {
  const { id, type } = useTrackableMeta();

  const firstDayDate = Date.UTC(year, month, 1);
  const lastDayDate = endOfMonth(firstDayDate).getTime();
  const prefaceWith = getISODay(firstDayDate) - 1;

  const [data, dataInfo] = useZeroTrackableData({
    id,
    firstDay: firstDayDate,
    lastDay: lastDayDate,
  });

  const mappedData = mapDataToRange(firstDayDate, lastDayDate, data);

  return (
    <>
      <MonthVisualCalendar
        data={mappedData}
        prefaceDays={prefaceWith}
        mini={mini}
      />
    </>
  );
};

const activeMonths = (year: number, now: Date) => {
  if (year < getYear(now)) {
    return 12;
  }
  if (year > getYear(now)) {
    return -1;
  }
  return getMonth(now);
};

const YearFetcher = ({
  year,
  openMonth,
}: {
  year: number;
  openMonth: (n: number) => void;
}) => {
  const { id } = useTrackableMeta();

  const firstDayDate = Date.UTC(year, 0, 1);
  const lastDayDate = endOfYear(firstDayDate).getTime();
  const prefaceWith = getISODay(firstDayDate) - 1;

  const [data, dataInfo] = useZeroTrackableData({
    id,
    firstDay: firstDayDate,
    lastDay: lastDayDate,
  });

  const mappedData = mapDataToRange(firstDayDate, lastDayDate, data);

  return (
    <div className="my-4 flex flex-wrap gap-0.5">
      {mappedData.map((el, i) => {
        return (
          <div
            key={`${i}`}
            className={cn("h-3 w-3", el.value ? "bg-red-500" : "bg-blue-500")}
          />
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

const ViewController = ({
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
  const { id } = useTrackableMeta();
  const view =
    typeof month !== "number" && typeof year === "number" ? "months" : "days";

  const openMonth = (m: number) => {
    setDates(year, m);
  };

  const z = useZ();

  z.query.TYL_trackableRecord.where(({ cmp, and }) =>
    and(
      cmp("trackableId", id),
      cmp("date", ">=", addMonths(startOfYear(new Date()), -2).getTime()),
      cmp("date", "<=", addMonths(endOfYear(new Date()), 2).getTime()),
    ),
  ).preload();

  return (
    <>
      <ViewController year={year} month={month} />

      <ErrorBoundary
        fallbackRender={({ error }: { error: Error }) => {
          return <div>{error.message}</div>;
        }}
      >
        {view === "days" && (
          <MonthFetcher year={year as number} month={month as number} />
        )}
        {view === "months" && (
          <YearFetcher year={year as number} openMonth={openMonth} />
        )}
      </ErrorBoundary>

      <hr className="my-4 h-[1px] border-none bg-neutral-900 opacity-10 outline-none dark:bg-neutral-50" />

      <TrackableNoteEditable />
    </>
  );
};

export default TrackableView;
