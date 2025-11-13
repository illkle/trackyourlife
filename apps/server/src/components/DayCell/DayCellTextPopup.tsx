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
      onClick={() => openDayEditor({ date, trackableId: id })}
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
        {value}
      </div>
    </button>
  );
};
