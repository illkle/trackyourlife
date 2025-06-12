import { getTagStyleHashed } from "@tyl/helpers/trackables";

import { ScrollArea, ScrollBar } from "~/@shad/components/scroll-area";
import { cn } from "~/@shad/utils";
import { LabelInside, useDayCellContext } from "~/components/DayCell";
import {
  openDayEditor,
  useAmIOpenInStore,
} from "~/components/Modal/EditorModalV2";
import { useTheme } from "~/components/Providers/next-themes/themes";
import { useTrackableFlag } from "~/components/Trackable/TrackableProviders/TrackableFlagsProvider";
import { useTrackableMeta } from "~/components/Trackable/TrackableProviders/TrackableProvider";

export const DayCellTagsPopup = () => {
  const { values, date, labelType } = useDayCellContext();

  const { resolvedTheme } = useTheme();

  const longDate = date.getDate() >= 10;

  const { id } = useTrackableMeta();
  const monthViewType = useTrackableFlag(id, "AnyMonthViewType");

  const isOpen = useAmIOpenInStore({ date, trackableId: id });

  return (
    <button
      className={cn(
        "box-border h-full w-full rounded-xs border-2",
        isOpen
          ? "border-neutral-500 dark:border-neutral-700"
          : "border-neutral-300 dark:border-neutral-900",
      )}
      onClick={() => openDayEditor({ date, trackableId: id })}
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
                  monthViewType === "calendar" &&
                    labelType === "auto" &&
                    (longDate ? "first:ml-5.5" : "first:ml-3.5"),

                  monthViewType === "calendar"
                    ? "rounded px-1 text-sm text-[9px]"
                    : "rounded-md px-1 text-sm",
                )}
                style={{
                  backgroundColor: getTagStyleHashed(
                    v.value ?? "",
                    resolvedTheme ?? "",
                  ),
                }}
              >
                <span className="text-neutral-950 dark:text-neutral-100">
                  {v.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </button>
  );
};
