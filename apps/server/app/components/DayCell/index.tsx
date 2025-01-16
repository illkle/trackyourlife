import type { ReactNode } from "react";
import { cn } from "@shad/utils";
import { format, isSameDay } from "date-fns";

import type { DbTrackableSelect } from "@tyl/db/schema";

import { Skeleton } from "~/@shad/components/skeleton";
import { useTrackableMeta } from "~/components/Providers/TrackableProvider";
import { useRecordUpdateHandler } from "~/utils/useZ";
import { DayCellBoolean } from "./DayCellBoolean";
import { DayCellNumber } from "./DayCellNumber";

export const DayCellBaseClasses =
  "@container w-full h-full relative select-none overflow-hidden border-transparent outline-none focus:outline-neutral-300 dark:focus:outline-neutral-600 border-2 rounded-sm";

export const DayCellDisplay = ({
  type,
  value,
  children,
  isLoading = false,
  outOfRange = false,
  className,
  createdAt,
  dateDay,
  onChange,
}: {
  children: ReactNode;
  type: DbTrackableSelect["type"];
  value?: string;
  createdAt?: number | null;
  isLoading?: boolean;
  outOfRange?: boolean;
  disabled?: boolean;
  className?: string;
  dateDay: Date;
  onChange: (v: string) => void | Promise<void>;
}) => {
  if (outOfRange)
    return (
      <div
        className={cn(
          className,
          "cursor-default bg-neutral-100 dark:bg-neutral-900",
        )}
      >
        {children}
      </div>
    );

  if (isLoading) {
    return (
      <Skeleton
        className={cn(
          className,
          "cursor-default bg-neutral-100 dark:bg-neutral-900",
        )}
      />
    );
  }

  if (type === "boolean") {
    return (
      <DayCellBoolean className={className} value={value} onChange={onChange}>
        {children}
      </DayCellBoolean>
    );
  }

  if (type === "number") {
    return (
      <DayCellNumber
        className={className}
        value={value}
        onChange={onChange}
        dateDay={dateDay}
      >
        {children}
      </DayCellNumber>
    );
  }

  throw new Error("Unsupported trackable type");
};

export const DayCellWrapper = ({
  date,
  disabled,
  className,
  labelType = "auto",
  isLoading = false,
  recordId,
  value,
  createdAt,
}: {
  date: Date;
  recordId?: string;
  isLoading?: boolean;
  className?: string;
  value?: string;
  createdAt?: number | null;
  disabled?: boolean;
  labelType?: "auto" | "outside" | "none";
}) => {
  const { id, type } = useTrackableMeta();

  const isToday = isSameDay(date, new Date());

  const onChange = useRecordUpdateHandler(date, recordId);

  return (
    <div className="flex flex-col">
      {labelType !== "none" && (
        <div
          className={cn(
            "mr-1 text-right text-xs text-neutral-800",
            labelType === "outside" ? "" : "md:hidden",
            isToday ? "font-normal underline" : "font-light",
          )}
        >
          {format(date, "d")}
        </div>
      )}

      <DayCellDisplay
        className={cn(DayCellBaseClasses, className)}
        type={type}
        isLoading={isLoading}
        outOfRange={disabled}
        dateDay={date}
        value={value}
        onChange={onChange}
        createdAt={createdAt}
      >
        {labelType !== "none" && (
          <div
            className={cn(
              "absolute left-1 top-0 z-10 select-none text-base text-neutral-800",
              labelType === "outside" ? "hidden" : "max-md:hidden",
              isToday ? "font-normal underline" : "font-light",
            )}
          >
            {format(date, "d")}
          </div>
        )}
      </DayCellDisplay>
    </div>
  );
};

export default DayCellWrapper;
