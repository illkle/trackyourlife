import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@shad/utils";
import { format, isSameDay } from "date-fns";
import { createPortal } from "react-dom";

import type { DbTrackableSelect } from "@tyl/db/schema";

import { Skeleton } from "~/@shad/components/skeleton";
import { useEditorModal } from "~/components/EditorModal";
import { LazyTextEditor } from "~/components/LazyTextEditor";
import { useTrackableMeta } from "~/components/Providers/TrackableProvider";
import { useRecordUpdateHandler } from "~/utils/useZ";
import { DayCellBoolean } from "./DayCellBoolean";
import { DayCellNumber } from "./DayCellNumber";
import { Dialog, DialogContent, DialogTrigger } from "./floatyDialog";

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

  if (type === "text") {
    return (
      <DayCellText
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

interface DayCellTextProps extends DayCellRouterProps {
  isToday: boolean;
  onChange: (content: string, timestamp?: number) => void;
}

const DayCellText = ({
  value,
  createdAt,
  onChange,
  className,
  children,
}: {
  value?: string;
  createdAt?: number | null;
  className?: string;
  onChange: (content: string, timestamp?: number) => void;
}) => {
  const { ref, registerClient, unregisterClient } = useEditorModal();
  const [isOpen, setIsOpen] = useState(false);

  const id = useId();

  const open = () => {
    const ur = registerClient(id, () => setIsOpen(false));

    setIsOpen(true);
  };

  useEffect(() => {
    return () => {
      unregisterClient(id);
    };
  }, [id]);

  return (
    <button
      className={cn(
        "flex flex-col overflow-ellipsis border border-2 border-neutral-200 p-2 pt-6 text-left text-xs text-neutral-700 dark:border-neutral-900 dark:text-neutral-500",
        className,
      )}
      onClick={open}
    >
      {children}
      <div dangerouslySetInnerHTML={{ __html: value ?? "" }} />
      {isOpen &&
        createPortal(
          <LazyTextEditor
            content={value ?? ""}
            contentTimestamp={createdAt ?? 0}
            updateContent={onChange}
            onBlur={() => {
              console.log("blur");
              unregisterClient(id);
            }}
          />,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          ref.current!,
        )}
    </button>
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
