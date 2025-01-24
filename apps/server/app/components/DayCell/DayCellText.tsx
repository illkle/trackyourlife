import { useMemo, useState } from "react";
import { cn } from "@shad/utils";
import { format } from "date-fns";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "~/@shad/components/drawer";
import {
  DayCellBaseClasses,
  LabelInside,
  useDayCellContext,
} from "~/components/DayCell";
import { EditorModal } from "~/components/EditorModal";
import { LazyTextEditor, SubmitHook } from "~/components/LazyTextEditor";
import { useTrackableMeta } from "~/components/TrackableProviders/TrackableProvider";
import { useIsDesktop } from "~/utils/useIsDesktop";

export const DayCellText = () => {
  const { name } = useTrackableMeta();

  const { value, onChange, createdAt, date, labelType } = useDayCellContext();

  const [isOpen, setIsOpen] = useState(false);

  const isDesktop = useIsDesktop();

  const pretty = useMemo(() => {
    if (!value) return "";

    return value.split("\n")[0];
  }, [value]);

  return (
    <div className="h-full w-full flex-col overflow-y-scroll rounded-sm border-2 border-neutral-200 text-sm dark:border-neutral-900">
      <LazyTextEditor
        debug={date.getDate() === 1}
        content={value ?? ""}
        contentTimestamp={createdAt ?? 0}
        updateContent={onChange}
        className="h-full p-1"
      >
        <SubmitHook
          onSubmit={() => {
            setIsOpen(false);
          }}
        ></SubmitHook>
      </LazyTextEditor>
    </div>
  );
};
