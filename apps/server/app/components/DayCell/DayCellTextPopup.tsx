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

export const DayCellTextPopup = () => {
  const { name } = useTrackableMeta();

  const { value, onChange, createdAt, date, labelType } = useDayCellContext();

  const [isOpen, setIsOpen] = useState(false);

  const isDesktop = useIsDesktop();

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
      autoFocus={true}
    >
      <SubmitHook
        onSubmit={() => {
          setIsOpen(false);
        }}
      ></SubmitHook>
    </LazyTextEditor>
  );

  const c = (
    <button
      className={cn(
        "flex-col overflow-ellipsis border-2 p-1 text-left text-neutral-700 dark:text-neutral-500 sm:p-2",
        DayCellBaseClasses,
        isOpen
          ? "border-neutral-500 dark:border-neutral-700"
          : value?.length
            ? "border-neutral-300 dark:border-neutral-900"
            : "border-neutral-100 dark:border-neutral-900",
      )}
      onClick={(e) => {
        setIsOpen(true);

        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {labelType === "auto" && <LabelInside />}
      <div className="flex h-full max-w-full items-center overflow-hidden overflow-ellipsis whitespace-nowrap text-xs font-normal sm:text-sm">
        {pretty}
      </div>
    </button>
  );

  if (isDesktop)
    return (
      <>
        {c}
        <EditorModal
          open={isOpen}
          onOpenChange={(v) => {
            setIsOpen(v);
          }}
        >
          <div className="absolute left-0 top-0 z-10 flex h-8 w-full items-center justify-between border-b border-neutral-200 px-4 text-sm font-bold dark:border-neutral-800">
            {format(date, "MMM d")}{" "}
            <span className="text-xs font-normal opacity-50">{name}</span>
          </div>
          <div className="customScrollBar h-full max-h-[min(60svh,60vh,150px)] overflow-y-scroll">
            {e}
          </div>
        </EditorModal>
      </>
    );

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{c}</DrawerTrigger>
      <DrawerContent className="max-h-[60svh]">
        <DrawerDescription></DrawerDescription>
        <DrawerTitle>{format(date, "MMM d")}</DrawerTitle>
        <div className="overflow-y-auto p-3">
          <div className="overflow-y-scroll rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
            {e}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
