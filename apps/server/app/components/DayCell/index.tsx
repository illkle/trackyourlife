import type { ReactNode } from "react";
import { useCallback } from "react";
import { cn } from "@shad/utils";
import { format, isSameDay } from "date-fns";

import type { DbTrackableSelect } from "@tyl/db/schema";

import { Skeleton } from "~/@shad/components/skeleton";
import { useTrackableMeta } from "~/components/Providers/TrackableProvider";
import { useZ } from "~/utils/useZ";
import { DayCellBoolean } from "./DayCellBoolean";
import { DayCellNumber } from "./DayCellNumber";
import { DayCellRange } from "./DayCellRange";

export const DayCellBaseClasses =
  "@container w-full h-full relative select-none overflow-hidden border-transparent outline-none focus:outline-neutral-300 dark:focus:outline-neutral-600 border-2 rounded-sm";

const DayCellInner = ({
  type,
  value,
  children,
  isLoading = false,
  outOfRange = false,
  className,
  dateDay,
  onChange,
}: {
  children: ReactNode;
  type: DbTrackableSelect["type"];
  value?: string;
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

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (type === "range") {
    return (
      <DayCellRange className={className} value={value} onChange={onChange}>
        {children}
      </DayCellRange>
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
  value,
}: {
  date: Date;
  isLoading?: boolean;
  className?: string;
  value?: string;
  disabled?: boolean;
  labelType?: "auto" | "outside" | "none";
}) => {
  const { id, type } = useTrackableMeta();

  const isToday = isSameDay(date, new Date());

  const z = useZ();

  const onChange = useCallback(
    async (val: string) => {
      const d = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

      await z.mutate.TYL_trackableRecord.upsert({
        date: d,
        trackableId: id,
        value: val,
        user_id: z.userID,
      });
    },
    [date, id, z],
  );

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

      <DayCellInner
        className={cn(DayCellBaseClasses, className)}
        type={type}
        isLoading={isLoading}
        outOfRange={disabled}
        dateDay={date}
        value={value}
        onChange={onChange}
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
      </DayCellInner>
    </div>
  );
};

export default DayCellWrapper;
