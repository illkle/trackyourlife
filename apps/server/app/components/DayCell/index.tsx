import { createContext, useContext } from "react";
import { cn } from "@shad/utils";
import { format, isAfter, isBefore, isSameDay } from "date-fns";

import type { DbTrackableSelect } from "@tyl/db/schema";

import { DayCellText } from "~/components/DayCell/DayCellText";
import { useTrackableFlags } from "~/components/TrackableProviders/TrackableFlagsProvider";
import { useTrackableMeta } from "~/components/TrackableProviders/TrackableProvider";
import { useRecordUpdateHandler } from "~/utils/useZ";
import { DayCellBoolean } from "./DayCellBoolean";
import { DayCellNumber } from "./DayCellNumber";

export const DayCellBaseClasses =
  "@container w-full h-full relative select-none overflow-hidden border-transparent  border-2 rounded-sm";

export const DayCellBaseClassesFocus =
  "outline-none focus:outline-neutral-300 dark:focus:outline-neutral-600";

interface IDayCellContext {
  date: Date;
  isToday: boolean;
  isOutOfRange: boolean;
  value?: string;
  recordId?: string;
  onChange: (v: string) => void | Promise<void>;
  createdAt?: number | null;

  labelType?: "auto" | "outside" | "none";
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

type DayCellRouterProps = Pick<
  IDayCellContext,
  "date" | "value" | "recordId" | "createdAt" | "labelType"
> & {
  className?: string;

  onChange?: (v: string) => void;
};

export const DayCellRouter = ({
  date,
  labelType = "auto",
  recordId,
  value,
  createdAt,
  className,
}: DayCellRouterProps) => {
  const { id } = useTrackableMeta();

  const { type } = useTrackableMeta();

  const { getFlag } = useTrackableFlags();
  const trackingStart = getFlag(id, "AnyTrackingStart");

  const now = new Date();
  const isToday = isSameDay(date, now);
  const isOutOfRange =
    isAfter(date, now) || Boolean(trackingStart && isBefore(date, now));

  const onChange = useRecordUpdateHandler(date, recordId);

  return (
    <DayCellContext.Provider
      value={{
        date,
        isToday,
        isOutOfRange,
        value,
        recordId,
        onChange,
        createdAt,
        labelType,
      }}
    >
      <div className={cn("flex flex-1 flex-col", className)}>
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
    return <DayCellBoolean></DayCellBoolean>;
  }

  if (type === "number") {
    return <DayCellNumber></DayCellNumber>;
  }

  if (type === "text") {
    return <DayCellText></DayCellText>;
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
        "absolute left-1 top-0 z-10 select-none text-base text-neutral-800",
        isToday ? "font-normal underline" : "font-light",
      )}
    >
      {format(date, "d")}
    </div>
  );
};

export default DayCellRouter;
