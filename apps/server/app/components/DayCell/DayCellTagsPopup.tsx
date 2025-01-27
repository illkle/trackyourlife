import { useMemo, useState } from "react";
import { format } from "date-fns";
import { SendIcon, XIcon } from "lucide-react";

import {
  findClosestDarkmode,
  findClosestLightmode,
  stringToColorHSL,
} from "@tyl/helpers/colorTools";

import { Button } from "~/@shad/components/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "~/@shad/components/drawer";
import { Input } from "~/@shad/components/input";
import { cn } from "~/@shad/utils";
import { LabelInside, useDayCellContext } from "~/components/DayCell";
import { EditorModal } from "~/components/EditorModal";
import { useTheme } from "~/components/Providers/next-themes/themes";
import { useTrackableMeta } from "~/components/TrackableProviders/TrackableProvider";
import { useIsDesktop } from "~/utils/useIsDesktop";

const SubInput = () => {
  const { values, onChange } = useDayCellContext();
  const valuesSet = useMemo(
    () => new Set(values.map((v) => v.value ?? "")),
    [values],
  );

  const [value, setValue] = useState("");

  const send = async () => {
    if (!value.length) return;

    if (!valuesSet.has(value)) {
      await onChange(value, undefined, new Date().getTime());
    }
    setValue("");
  };

  return (
    <div className="mt-2 flex w-full items-center gap-2 px-0.5">
      <Input
        value={value}
        autoFocus
        onChange={(e) => {
          setValue(e.target.value);
        }}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            void send();
          }
        }}
        className="w-full"
      />
      <Button variant="outline" size="icon" onClick={send}>
        <SendIcon size={16} />
      </Button>
    </div>
  );
};

export const DayCellTagsPopup = () => {
  const { name } = useTrackableMeta();
  const { values, date, labelType, onDelete } = useDayCellContext();

  const { resolvedTheme } = useTheme();

  const longDate = date.getDate() >= 10;

  const [isOpen, setIsOpen] = useState(false);

  const isDesktop = useIsDesktop();

  const e = (
    <div className="flex flex-col py-2">
      <div className="flex flex-shrink overflow-y-scroll">
        <div className="flex w-full flex-wrap gap-0.5">
          {values.map((v) => (
            <div
              key={v.recordId}
              className={cn(
                "flex w-fit max-w-full items-center gap-1 overflow-hidden rounded-xs px-1 text-sm text-nowrap text-ellipsis",
              )}
              style={{
                backgroundColor: getStyleHashed(
                  v.value ?? "",
                  resolvedTheme ?? "",
                ),
              }}
            >
              <span className="text-neutral-950 dark:text-neutral-100">
                {v.value}
              </span>
              <Button
                variant="ghost"
                className="h-4 rounded-sm px-1"
                size={"sm"}
                onClick={() => onDelete(v.recordId)}
              >
                <XIcon size={14} />
              </Button>
            </div>
          ))}
        </div>
      </div>
      <SubInput />
    </div>
  );

  const c = (
    <button
      onClick={(e) => {
        setIsOpen(true);
        e.preventDefault();
        e.stopPropagation();
      }}
      className="relative box-border flex h-full w-full items-end justify-end overflow-y-scroll rounded-xs border-2 border-neutral-200 p-1.5 text-sm text-[9px] dark:border-neutral-900"
    >
      {labelType === "auto" && <LabelInside />}

      <div className="flex max-h-full max-w-full flex-wrap justify-end gap-0.5">
        {values.map((v) => (
          <div
            key={v.recordId}
            className={cn(
              "max-w-fit overflow-hidden rounded-xs px-1 text-nowrap text-ellipsis",
              longDate ? "first:ml-5.5" : "first:ml-3.5",
            )}
            style={{
              backgroundColor: getStyleHashed(
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
          <div className="absolute top-0 left-0 z-10 flex h-8 w-full items-center justify-between border-b border-neutral-200 px-4 text-sm font-bold dark:border-neutral-800">
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

const getStyleHashed = (v: string, theme: string) => {
  const c = stringToColorHSL(v);

  const cc =
    theme === "dark" ? findClosestDarkmode(c) : findClosestLightmode(c);

  return `hsl(${cc.h}, ${cc.s}%, ${cc.l}%)`;
};
