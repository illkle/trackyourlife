import { createContext, useContext } from "react";
import { cn } from "@shad/utils";
import { format, isAfter, isBefore, isSameDay } from "date-fns";

import type { DbTrackableSelect } from "@tyl/db/schema";
import type { PureDataRecord } from "@tyl/helpers/trackables";

import { DayCellLogsPopup } from "~/components/DayCell/DayCellLogsPopup";
import { DayCellTagsPopup } from "~/components/DayCell/DayCellTagsPopup";
import { DayCellTextPopup } from "~/components/DayCell/DayCellTextPopup";
import { useTrackableFlag } from "~/components/Trackable/TrackableProviders/TrackableFlagsProvider";
import { useTrackableMeta } from "~/components/Trackable/TrackableProviders/TrackableProvider";
import {
  useAttrbutesUpdateHandler,
  useRecordDeleteHandler,
  useRecordUpdateHandler,
} from "~/utils/useZ";
import { DayCellBoolean } from "./DayCellBoolean";
import { DayCellNumber } from "./DayCellNumber";

export const DayCellBaseClasses =
  "@container w-full h-full relative select-none overflow-hidden border-transparent border-2 rounded-xs";

export const DayCellBaseClassesFocus =
  "outline-hidden focus:outline-neutral-300 dark:focus:outline-neutral-600";

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
  onChangeAttributes: ReturnType<typeof useAttrbutesUpdateHandler>;
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
  date,
  values,
  labelType = "auto",
  className,
}: DayCellRouterProps) => {
  // TODO: memo?
  const { id, type } = useTrackableMeta();
  const trackingStart = useTrackableFlag(id, "AnyTrackingStart");

  const now = new Date();
  const isToday = isSameDay(date, now);
  const isOutOfRange =
    isAfter(date, now) ||
    Boolean(trackingStart && isBefore(date, trackingStart));

  const onChange = useRecordUpdateHandler({ date, trackableId: id, type });
  const onDelete = useRecordDeleteHandler();
  const onChangeAttributes = useAttrbutesUpdateHandler({
    trackableId: id,
  });

  return (
    <DayCellContext.Provider
      value={{
        date,
        isToday,
        isOutOfRange,
        values,
        onChange,
        onDelete,
        labelType,
        onChangeAttributes,
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
  type: DbTrackableSelect["type"];
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

  if (type === "tags") {
    return <DayCellTagsPopup />;
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (type === "logs") {
    return <DayCellLogsPopup />;
  }

  throw new Error("Unsupported trackable type");
};

export const OutOfRangeSimple = () => {
  const { labelType } = useDayCellContext();

  return (
    <div
      className={cn(
        DayCellBaseClasses,
        "cursor-default bg-neutral-100 dark:bg-neutral-900",
      )}
    >
      {labelType === "auto" && <LabelInside />}
    </div>
  );
};

const LabelOutside = () => {
  const { date, isToday } = useDayCellContext();

  return (
    <div
      className={cn(
        "mr-1 text-right text-xs text-neutral-800",
        isToday ? "font-normal underline" : "font-light",
      )}
    >
      {format(date, "d")}
    </div>
  );
};

export const LabelInside = () => {
  const { date, isToday } = useDayCellContext();
  return (
    <div
      className={cn(
        "absolute top-0 left-1 z-10 text-base text-neutral-800 select-none",
        isToday ? "font-normal underline" : "font-light",
        "text-xs sm:text-base",
      )}
    >
      {format(date, "d")}
    </div>
  );
};

export default DayCellRouter;
