import { useState } from "react";
import { format } from "date-fns";
import { CornerRightUp, XIcon } from "lucide-react";

import type { RecordValue } from "@tyl/helpers/trackables";

import { Button } from "~/@shad/components/button";
import { Input } from "~/@shad/components/input";
import { ScrollArea, ScrollBar } from "~/@shad/components/scroll-area";
import { cn } from "~/@shad/utils";
import { LabelInside, useDayCellContext } from "~/components/DayCell";
import EditableText from "~/components/Inputs/EditableText";
import {
  DynamicModal,
  DynamicModalContent,
  DynamicModalDescription,
  DynamicModalDrawerTitle,
  DynamicModalEditorTitle,
  DynamicModalTrigger,
} from "~/components/Modal/dynamicModal";
import { useTheme } from "~/components/Providers/next-themes/themes";
import { useTrackableFlags } from "~/components/Trackable/TrackableProviders/TrackableFlagsProvider";
import { useTrackableMeta } from "~/components/Trackable/TrackableProviders/TrackableProvider";

const LogsEntry = ({
  value,
  onSubmit,
  onDelete,
}: {
  value: RecordValue;
  onSubmit: (v: string) => void;
  onDelete: () => void;
}) => {
  return (
    <div className="flex gap-2">
      <span>{format(value.timestamp, "HH:mm:ss")}</span>
      <EditableText value={value.value} updater={onSubmit} />
      <Button
        variant="ghost"
        size="sm"
        className="h-fit p-1 opacity-50 hover:opacity-100"
        onClick={onDelete}
      >
        <XIcon size={14} />
      </Button>
    </div>
  );
};

export const DayCellLogsPopup = () => {
  const { name } = useTrackableMeta();
  const { values, date, labelType, onDelete, onChange } = useDayCellContext();

  const { resolvedTheme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);

  const { id } = useTrackableMeta();
  const { getFlag } = useTrackableFlags();
  const monthViewType = getFlag(id, "AnyMonthViewType");

  return (
    <DynamicModal open={isOpen} onOpenChange={setIsOpen}>
      <DynamicModalTrigger
        className={cn(
          "box-border h-full w-full rounded-xs border-2 border-neutral-200 dark:border-neutral-900",
        )}
      >
        <ScrollArea className="relative h-full">
          <ScrollBar orientation="vertical" />
          <div
            className={cn(
              "relative flex p-1.5",
              monthViewType === "calendar"
                ? "items-end justify-end"
                : "justify-start",
            )}
          >
            {labelType === "auto" && <LabelInside />}
            <div
              className={cn(
                "flex max-h-full max-w-full flex-wrap",
                monthViewType === "calendar" ? "gap-0.5" : "gap-1",
              )}
            >
              {values.map((v) => (
                <div
                  key={v.recordId}
                  className={cn(
                    "max-w-fit overflow-hidden text-nowrap text-ellipsis",
                  )}
                >
                  <span className="text-neutral-950 dark:text-neutral-100">
                    {v.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DynamicModalTrigger>
      <DynamicModalContent key={date.getTime()}>
        <DynamicModalDrawerTitle>
          {format(date, "MMMM d")}
        </DynamicModalDrawerTitle>

        <DynamicModalEditorTitle>
          {format(date, "MMMM d")}
          <span className="text-xs font-normal opacity-50">{name}</span>
        </DynamicModalEditorTitle>

        <DynamicModalDescription>{name}</DynamicModalDescription>

        <ScrollArea className="mb-3 flex h-full max-h-[400px] flex-col px-4 md:mr-11 md:mb-0.5">
          <ScrollBar orientation="vertical" />
          {values.map((v) => (
            <LogsEntry
              key={v.recordId}
              value={v}
              onSubmit={(newVal) => {
                void onChange(newVal, v.recordId);
              }}
              onDelete={() => {
                void onDelete(v.recordId);
              }}
            />
          ))}
        </ScrollArea>
        <div className="px-2 pb-4">
          <InputEditor
            onSubmit={(newVal) => {
              void onChange(newVal, undefined, new Date().getTime());
            }}
          />
        </div>
      </DynamicModalContent>
    </DynamicModal>
  );
};

const InputEditor = ({ onSubmit }: { onSubmit: (v: string) => void }) => {
  const [value, setValue] = useState("");

  return (
    <div className="flex gap-2">
      <Input
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            void onSubmit(value);
          }
        }}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button variant="outline" size="icon" onClick={() => onSubmit(value)}>
        <CornerRightUp size={16} />
      </Button>
    </div>
  );
};
