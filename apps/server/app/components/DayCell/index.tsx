import type { ReactNode } from "react";
import { useId, useMemo, useState } from "react";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { cn } from "@shad/utils";
import { format, isSameDay } from "date-fns";

import type { DbTrackableSelect } from "@tyl/db/schema";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "~/@shad/components/drawer";
import { Skeleton } from "~/@shad/components/skeleton";
import { LazyTextEditor } from "~/components/LazyTextEditor";
import { useSingleton } from "~/components/Providers/singletonProvider";
import { useTrackableMeta } from "~/components/Providers/TrackableProvider";
import { useIsDesktop } from "~/utils/useIsDesktop";
import { useRecordUpdateHandler } from "~/utils/useZ";
import { DayCellBoolean } from "./DayCellBoolean";
import { DayCellNumber } from "./DayCellNumber";
import { Dialog, DialogContent } from "./floatyDialog";

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
  date,
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
  date: Date;
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

  if (type === "text") {
    return (
      <DayCellText
        date={date}
        value={value}
        className={className}
        createdAt={createdAt}
        onChange={onChange}
      >
        {children}
      </DayCellText>
    );
  }

  throw new Error("Unsupported trackable type");
};

interface DayCellRouterProps {
  date: Date;
  disabled?: boolean;
  className?: string;
  labelType?: "auto" | "outside" | "none";
  isLoading?: boolean;
  recordId?: string;
  value?: string;
  createdAt?: number | null;
}

const DayCellText = ({
  date,
  value,
  createdAt,
  onChange,
  className,
  children,
}: {
  date: Date;
  value?: string;
  createdAt?: number | null;
  className?: string;
  onChange: (content: string, timestamp?: number) => void;
  children: ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const isDesktop = useIsDesktop();

  const id = useId();

  const { registerSingleton } = useSingleton();

  const pretty = useMemo(() => {
    if (!value) return "";

    return value.split("\n")[0];
  }, [value]);

  const e = (
    <LazyTextEditor
      content={value ?? ""}
      contentTimestamp={createdAt ?? 0}
      updateContent={onChange}
      className="mt-2"
    />
  );

  const c = (
    <button
      className={cn(
        "flex-col overflow-ellipsis border border-2 p-1 text-left text-neutral-700 dark:text-neutral-500 sm:p-2",

        className,
        isOpen
          ? "border-neutral-500 dark:border-neutral-700"
          : value?.length
            ? "border-neutral-300 dark:border-neutral-900"
            : "border-neutral-100 dark:border-neutral-900",
      )}
      onMouseDown={(e) => {
        setIsOpen(true);
        registerSingleton(id, () => setIsOpen(false));

        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {children}
      <div className="flex h-full max-w-full items-center overflow-hidden overflow-ellipsis whitespace-nowrap text-xs font-normal sm:text-sm">
        {pretty}
      </div>
    </button>
  );

  if (isDesktop)
    return (
      <Dialog
        modal={false}
        open={isOpen}
        onOpenChange={(v) => {
          setIsOpen(v);
        }}
      >
        {c}
        <DialogContent
          className={cn("max-h-[min(60svh,60vh,200px)] px-4 pb-2 pt-8")}
        >
          <DialogDescription></DialogDescription>
          <DialogTitle className="absolute left-0 top-0 flex h-8 w-full items-center justify-between border-b border-neutral-200 px-4 text-sm font-bold dark:border-neutral-800">
            {format(date, "MMM d")}
          </DialogTitle>
          {e}
        </DialogContent>
      </Dialog>
    );

  return (
    <Drawer>
      <DrawerTrigger asChild>{c}</DrawerTrigger>
      <DrawerContent className="max-h-[60svh]">
        <DrawerDescription></DrawerDescription>
        <DrawerTitle>{format(date, "MMM d")}</DrawerTitle>
        <div className="overflow-y-auto p-3">
          <div className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
            {e}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export const DayCellRouter = ({
  date,
  disabled,
  className,
  labelType = "auto",
  isLoading = false,
  recordId,
  value,
  createdAt,
}: DayCellRouterProps) => {
  const { type } = useTrackableMeta();

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
        date={date}
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

export default DayCellRouter;
