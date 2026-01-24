import { cn } from "@shad/lib/utils";

import { DayCellBaseClasses, IDayCellProps, LabelInside } from "~/components/DayCell";
import { openDayEditor, useAmIOpenInStore } from "~/components/Modal/EditorModalV2";
import { useTrackableMeta } from "@tyl/helpers/data/TrackableMetaProvider";

export const DayCellTextPopup = (props: IDayCellProps) => {
  const { id, name, type } = useTrackableMeta();
  const { labelType, values, timestamp } = props.cellData;
  const { value } = values[0] ?? {};

  const isOpen = useAmIOpenInStore({
    date: timestamp,
    trackable: { id, type, name },
  });

  return (
    <button
      data-text-cell
      onClick={() => openDayEditor({ date: timestamp, trackable: { id, type, name } })}
      className={cn(
        "flex-col border-2 p-1 text-left text-ellipsis text-foreground sm:p-2",
        DayCellBaseClasses,
        isOpen ? "border-ring" : value?.length ? "border-border" : "border-border opacity-50",
      )}
    >
      {labelType === "auto" && <LabelInside cellData={props.cellData} />}
      <div className="flex h-full max-w-full items-center overflow-hidden text-xs font-normal text-ellipsis whitespace-nowrap sm:text-sm">
        {value}
      </div>
    </button>
  );
};
