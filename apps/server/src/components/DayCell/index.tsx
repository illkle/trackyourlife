import { createContext, useContext } from "react";
import { cn } from "@shad/lib/utils";
import { format, isAfter, isBefore, isSameDay } from "date-fns";

import type { DbTrackableSelect } from "@tyl/db/server/schema";
import type { PureDataRecord } from "@tyl/helpers/trackables";

import { DayCellTextPopup } from "~/components/DayCell/DayCellTextPopup";
import { useTrackableFlag } from "~/components/Trackable/TrackableProviders/TrackableFlagsProvider";
import { useTrackableMeta } from "~/components/Trackable/TrackableProviders/TrackableProvider";
import { useRecordDeleteHandler, useRecordUpdateHandler } from "~/utils/useZ";
import { DayCellBoolean } from "./DayCellBoolean";
import { DayCellNumber } from "./DayCellNumber";

export const DayCellBaseClasses =
  "@container w-full h-full relative select-none overflow-hidden border-transparent border-2 rounded-xs";

export const DayCellBaseClassesFocus = "outline-hidden focus:outline-ring";

interface DayCellRouterProps extends PureDataRecord {
  className?: string;
  labelType: IDayCellLabelType;
}

export type IDayCellLabelType = "auto" | "outside" | "none";

export interface IDayCellContext extends Omit<PureDataRecord, "disabled"> {
  isToday: boolean;
  isOutOfRange: boolean;
  onChange: ReturnType<typeof useRecordUpdateHandler>;
  onDelete: ReturnType<typeof useRecordDeleteHandler>;
  labelType?: IDayCellLabelType;
}

export const DayCellContext = createContext<IDayCellContext | null>(null);

export const useDayCellContext = () => {
  const context = useContext(DayCellContext);
  if (!context)
    throw new Error(
      "useDayCellContext must be used within a DayCellContext provider",
    );
  return context;
};

export const DayCellRouter = ({
  timestamp,
  values,
  labelType = "auto",
  className,
}: DayCellRouterProps) => {
  // TODO: memo?
  const { id, type } = useTrackableMeta();
  const trackingStart = useTrackableFlag(id, "AnyTrackingStart");

  const now = new Date();
  const isToday = isSameDay(timestamp, now);
  const isOutOfRange =
    isAfter(timestamp, now) ||
    Boolean(trackingStart && isBefore(timestamp, trackingStart));

  const onChange = useRecordUpdateHandler({
    date: timestamp,
    trackableId: id,
    type,
  });
  const onDelete = useRecordDeleteHandler();

  return (
    <DayCellContext.Provider
      value={{
        timestamp,
        isToday,
        isOutOfRange,
        values,
        onChange,
        onDelete,
        labelType,
      }}
    >
      <div className={cn("relative flex flex-1 flex-col", className)}>
        {labelType === "outside" && <LabelOutside />}
        <DayCellTypeRouter type={type}></DayCellTypeRouter>
      </div>
    </DayCellContext.Provider>
  );
};

export const DayCellTypeRouter = ({
  type,
}: {
  type: DbTrackableSelect["type"] | string;
}) => {
  const { isOutOfRange } = useDayCellContext();

  if (isOutOfRange) {
    return <OutOfRangeSimple />;
  }

  if (type === "boolean") {
    return <DayCellBoolean />;
  }

  if (type === "number") {
    return <DayCellNumber />;
  }

  if (type === "text") {
    return <DayCellTextPopup />;
  }

  throw new Error("Unsupported trackable type");
};

export const OutOfRangeSimple = () => {
  const { labelType } = useDayCellContext();

  return (
    <div
      className={cn(DayCellBaseClasses, "bg-muted cursor-default opacity-30")}
    >
      {labelType === "auto" && <LabelInside />}
    </div>
  );
};

const LabelOutside = () => {
  const { timestamp, isToday } = useDayCellContext();

  return (
    <div
      className={cn(
        "text-muted-foreground mr-1 text-right text-xs",
        isToday ? "font-normal underline" : "font-light",
      )}
    >
      {format(timestamp, "d")}
    </div>
  );
};

export const LabelInside = () => {
  const { timestamp, isToday } = useDayCellContext();
  return (
    <div
      className={cn(
        "text-muted-foreground absolute left-1 top-0 z-10 select-none text-base",
        isToday ? "font-normal underline" : "font-light",
        "text-xs sm:text-base",
      )}
    >
      {format(timestamp, "d")}
    </div>
  );
};

export default DayCellRouter;
