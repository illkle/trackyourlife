import { cn } from "@shad/lib/utils";

import {
  DayCellBaseClasses,
  LabelInside,
  useDayCellContext,
} from "~/components/DayCell";
import {
  openDayEditor,
  useAmIOpenInStore,
} from "~/components/Modal/EditorModalV2";
import { useTrackableMeta } from "~/components/Trackable/TrackableProviders/TrackableProvider";

export const DayCellTextPopup = () => {
  const { id } = useTrackableMeta();
  const { labelType, values, date } = useDayCellContext();
  const { value } = values[0] ?? {};

  const isOpen = useAmIOpenInStore({ date, trackableId: id });

  return (
    <button
      data-text-cell
      onClick={() => openDayEditor({ date, trackableId: id })}
      className={cn(
        "text-foreground flex-col text-ellipsis border-2 p-1 text-left sm:p-2",
        DayCellBaseClasses,
        isOpen
          ? "border-ring"
          : value?.length
            ? "border-border"
            : "border-border opacity-50",
      )}
    >
      {labelType === "auto" && <LabelInside />}
      <div className="flex h-full max-w-full items-center overflow-hidden text-ellipsis whitespace-nowrap text-xs font-normal sm:text-sm">
        {value}
      </div>
    </button>
  );
};
