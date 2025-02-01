import { useMemo, useState } from "react";
import { cn } from "@shad/utils";
import { format } from "date-fns";

import { ScrollArea } from "~/@shad/components/scroll-area";
import {
  DayCellBaseClasses,
  LabelInside,
  useDayCellContext,
} from "~/components/DayCell";
import { LazyTextEditor, SubmitHook } from "~/components/LazyTextEditor";
import {
  DynamicModal,
  DynamicModalContent,
  DynamicModalDescription,
  DynamicModalDrawerTitle,
  DynamicModalEditorTitle,
  DynamicModalTrigger,
} from "~/components/Modal/dynamicModal";
import { useTrackableMeta } from "~/components/Trackable/TrackableProviders/TrackableProvider";

export const DayCellTextPopup = () => {
  const { name } = useTrackableMeta();

  const { onChange, date, labelType, values } = useDayCellContext();
  const { value, recordId, createdAt } = values[0] ?? {};

  const [isOpen, setIsOpen] = useState(false);

  const pretty = useMemo(() => {
    if (!value) return "";

    return value.split("\n")[0];
  }, [value]);

  return (
    <DynamicModal open={isOpen} onOpenChange={setIsOpen}>
      <DynamicModalTrigger
        className={cn(
          "flex-col border-2 p-1 text-left text-ellipsis text-neutral-700 sm:p-2 dark:text-neutral-500",
          DayCellBaseClasses,
          isOpen
            ? "border-neutral-500 dark:border-neutral-700"
            : value?.length
              ? "border-neutral-300 dark:border-neutral-900"
              : "border-neutral-100 dark:border-neutral-900",
        )}
      >
        {labelType === "auto" && <LabelInside />}
        <div className="flex h-full max-w-full items-center overflow-hidden text-xs font-normal text-ellipsis whitespace-nowrap sm:text-sm">
          {pretty}
        </div>
      </DynamicModalTrigger>
      <DynamicModalContent key={date.getTime()}>
        <DynamicModalDrawerTitle>
          {format(date, "MMM d")}
        </DynamicModalDrawerTitle>

        <DynamicModalEditorTitle>
          {format(date, "MMM d")}
          <span className="text-xs font-normal opacity-50">{name}</span>
        </DynamicModalEditorTitle>

        <DynamicModalDescription>{name}</DynamicModalDescription>

        <ScrollArea className="flex max-h-[10000px] flex-col px-4">
          <LazyTextEditor
            content={value ?? ""}
            contentTimestamp={createdAt ?? 0}
            updateContent={(content, ts) => onChange(content, recordId, ts)}
            className="my-2"
            autoFocus={true}
          >
            <SubmitHook
              onSubmit={() => {
                setIsOpen(false);
              }}
            ></SubmitHook>
          </LazyTextEditor>
        </ScrollArea>
      </DynamicModalContent>
    </DynamicModal>
  );
};
