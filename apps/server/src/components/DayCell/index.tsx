import { memo, useMemo } from "react";
import { cn } from "@shad/lib/utils";
import { format, isAfter, isBefore, isSameDay } from "date-fns";

import { DayCellTextPopup } from "~/components/DayCell/DayCellTextPopup";
import { useTrackableMeta } from "@tyl/helpers/data/TrackableMetaProvider";
import { DayCellBoolean } from "./DayCellBoolean";
import { DayCellNumber } from "./DayCellNumber";
import { DbTrackableRecordSelect } from "@tyl/db/client/schema-powersync";
import { useRecordDeleteHandler, useRecordUpdateHandler } from "@tyl/helpers/data/dbHooksTanstack";
import { useTrackableDataDay } from "@tyl/helpers/data/TrackableDataProvider";
import { useTrackableFlagValueCached } from "@tyl/helpers/data/TrackableFlagsProvider";
import { useNowDay } from "@tyl/helpers/date/clockStore";

export const DayCellBaseClasses =
  "@container w-full h-full relative select-none overflow-hidden border-transparent border-2 rounded-xs";

export const DayCellBaseClassesFocus = "outline-hidden focus:outline-ring";

interface DayCellRouterProps {
  className?: string;
  labelType: IDayCellLabelType;
  disabled?: boolean;
  timestamp: Date;
}

export type IDayCellLabelType = "auto" | "outside" | "none";

export interface IDayCellData {
  type: string;
  timestamp: Date;
  isToday: boolean;
  isOutOfRange: boolean;
  onChange: ReturnType<typeof useRecordUpdateHandler>;
  onDelete: ReturnType<typeof useRecordDeleteHandler>;
  labelType?: IDayCellLabelType;
  values: DbTrackableRecordSelect[];
}

export type IDayCellProps = { cellData: IDayCellData };

export const DayCellRouter = memo(
  ({ timestamp, labelType = "auto", className }: DayCellRouterProps) => {
    const { type } = useTrackableMeta();
    const trackingStart = useTrackableFlagValueCached("AnyTrackingStart");

    const now = useNowDay();
    const isToday = useMemo(() => isSameDay(timestamp, now), [timestamp, now]);
    const isOutOfRange = useMemo(
      () => isAfter(timestamp, now) || Boolean(trackingStart && isBefore(timestamp, trackingStart)),
      [timestamp, now, trackingStart],
    );

    const onChange = useRecordUpdateHandler({
      date: timestamp,
    });
    const onDelete = useRecordDeleteHandler();

    const values = useTrackableDataDay(timestamp);

    const cellData = {
      type,
      isOutOfRange,
      values,
      onChange,
      onDelete,
      labelType,
      timestamp,
      isToday,
    };

    return (
      <div className={cn("relative flex flex-1 flex-col", className)}>
        {labelType === "outside" && <LabelOutside cellData={cellData} />}
        <DayCellTypeRouter cellData={cellData}></DayCellTypeRouter>
      </div>
    );
  },
);

export const DayCellTypeRouter = (props: IDayCellProps) => {
  if (props.cellData.isOutOfRange) {
    return <OutOfRangeSimple {...props} />;
  }

  if (props.cellData.type === "boolean") {
    return <DayCellBoolean cellData={props.cellData} />;
  }

  if (props.cellData.type === "number") {
    return <DayCellNumber cellData={props.cellData} />;
  }

  if (props.cellData.type === "text") {
    return <DayCellTextPopup cellData={props.cellData} />;
  }

  throw new Error("Unsupported trackable type");
};

export const OutOfRangeSimple = (props: IDayCellProps) => {
  return (
    <div className={cn(DayCellBaseClasses, "cursor-default bg-muted opacity-30")}>
      {props.cellData.labelType === "auto" && <LabelInside {...props} />}
    </div>
  );
};

const LabelOutside = (props: IDayCellProps) => {
  return (
    <div
      className={cn(
        "mr-1 text-right text-xs text-muted-foreground",
        props.cellData.isToday ? "font-normal underline" : "font-light",
      )}
    >
      {format(props.cellData.timestamp, "d")}
    </div>
  );
};

export const LabelInside = (props: IDayCellProps) => {
  return (
    <div
      className={cn(
        "absolute top-0 left-1 z-10 text-base text-muted-foreground select-none",
        props.cellData.isToday ? "font-normal underline" : "font-light",
        "text-xs sm:text-base",
      )}
    >
      {format(props.cellData.timestamp, "d")}
    </div>
  );
};

export default DayCellRouter;
