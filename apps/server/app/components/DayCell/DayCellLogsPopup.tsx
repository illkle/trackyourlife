import { ScrollArea, ScrollBar } from "~/@shad/components/scroll-area";
import { cn } from "~/@shad/utils";
import { LabelInside, useDayCellContext } from "~/components/DayCell";
import { openDayEditor } from "~/components/EditorModalV2";
import { useTrackableFlag } from "~/components/Trackable/TrackableProviders/TrackableFlagsProvider";
import { useTrackableMeta } from "~/components/Trackable/TrackableProviders/TrackableProvider";

export const DayCellLogsPopup = () => {
  const { values, date, labelType } = useDayCellContext();

  const { id } = useTrackableMeta();
  const monthViewType = useTrackableFlag(id, "AnyMonthViewType");

  const longDate = date.getDate() >= 10;

  return (
    <button
      onClick={() => openDayEditor({ date, trackableId: id })}
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
                  monthViewType === "calendar" &&
                    labelType === "auto" &&
                    (longDate ? "first:ml-5.5" : "first:ml-3.5"),
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
    </button>
  );
};
