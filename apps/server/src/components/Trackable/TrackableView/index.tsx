import { Fragment } from "react/jsx-runtime";
import { Spinner } from "@shad/components/spinner";
import { cn } from "@shad/lib/utils";
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
import { useTrackableData } from "@tyl/helpers/dbHooks";
import { mapDataToRange } from "@tyl/helpers/trackables";

import type { ITrackableFlagType } from "~/components/Trackable/TrackableProviders/trackableFlags";
import { Button } from "~/@shad/components/button";
import DayCellRouter from "~/components/DayCell";
import { QueryError } from "~/components/QueryError";
import { useTrackableFlag } from "~/components/Trackable/TrackableProviders/TrackableFlagsProvider";
import { useTrackableMeta } from "~/components/Trackable/TrackableProviders/TrackableProvider";
import { ViewController } from "~/components/Trackable/TrackableView/viewController";

const MonthVisualCalendar = ({
  data,
  mini,
}: {
  data: PureDataRecord[];
  mini?: boolean;
}) => {
  const prefaceWith = data[0] ? getISODay(data[0].timestamp) - 1 : 0;

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
                "-translate-y-0.5 select-none font-mono text-3xl font-extralight leading-[100%]",
                isToday(el.timestamp)
                  ? "text-foreground"
                  : "text-muted-foreground/40",
              )}
            >
              {format(el.timestamp, "dd")}
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

  const vt = useTrackableFlag(id, "AnyMonthViewType");
  const viewType = forceViewType ?? vt;
  const firstDayDate = startOfMonth(date).getTime();
  const lastDayDate = endOfMonth(date).getTime();

  const q = useTrackableData({
    id,
    firstDay: firstDayDate,
    lastDay: lastDayDate,
  });

  if (q.isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (q.error) {
    return <QueryError error={q.error} onRetry={q.refresh} />;
  }

  // Convert TrackableRecordRow[] to DataRecord[] by converting ISO string dates to timestamps
  const dataRecords = (q.data ?? []).map((record) => ({
    id: record.id,
    value: record.value,
    timestamp: new Date(record.timestamp).getTime(),
    updated_at: record.updated_at,
  }));

  const mappedData = mapDataToRange(firstDayDate, lastDayDate, dataRecords);

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

      <hr className="bg-muted-foreground outline-hidden my-4 h-px border-none opacity-10" />
    </>
  );
};

export default TrackableView;
