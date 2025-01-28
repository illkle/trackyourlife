import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { CornerRightUp, XIcon } from "lucide-react";

import type { TagsValuesMapper } from "@tyl/helpers/trackables";
import { clamp } from "@tyl/helpers";
import {
  findClosestDarkmode,
  findClosestLightmode,
  stringToColorHSL,
} from "@tyl/helpers/colorTools";

import { Badge } from "~/@shad/components/badge";
import { Button } from "~/@shad/components/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "~/@shad/components/drawer";
import { Input } from "~/@shad/components/input";
import { ScrollArea, ScrollBar } from "~/@shad/components/scroll-area";
import { cn } from "~/@shad/utils";
import { LabelInside, useDayCellContext } from "~/components/DayCell";
import { EditorModal } from "~/components/EditorModal";
import { useTheme } from "~/components/Providers/next-themes/themes";
import { useTrackableFlags } from "~/components/TrackableProviders/TrackableFlagsProvider";
import { useTrackableMeta } from "~/components/TrackableProviders/TrackableProvider";
import { useIsDesktop } from "~/utils/useIsDesktop";

const SubInput = () => {
  const { values, onChange } = useDayCellContext();
  const valuesSet = useMemo(
    () => new Set(values.map((v) => v.value ?? "")),
    [values],
  );

  const { id } = useTrackableMeta();
  const { getFlag, setFlag } = useTrackableFlags();
  const tagsValues = getFlag(id, "TagsValues");

  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);

  const valueRef = useRef("");
  const inputRef = useRef<HTMLInputElement>(null);

  const [suggestions, setSuggestions] = useState<string[]>(
    tagsValues.getSuggestions(""),
  );

  const actualSelected = clamp(selectedSuggestion, -1, suggestions.length - 1);

  if (selectedSuggestion !== actualSelected) {
    setSelectedSuggestion(actualSelected);
  }

  const updateSelected = (v: number) => {
    setSelectedSuggestion(v);
    const target = suggestions[v];
    if (target) {
      refMap.current.get(target)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const send = async (passedValue?: string) => {
    const v =
      selectedSuggestion === -1
        ? (passedValue ?? valueRef.current)
        : suggestions[selectedSuggestion];

    if (!v) return;

    if (!valuesSet.has(v)) {
      await onChange(v, undefined, new Date().getTime());
      await setFlag(id, "TagsValues", tagsValues.addAndReturnArray(v));
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    updateSuggestions("", tagsValues);
  };

  const refMap = useRef<Map<string, HTMLButtonElement>>(new Map());

  const updateSuggestions = useCallback(
    (query: string, tagsValues: TagsValuesMapper) => {
      setSuggestions(tagsValues.getSuggestions(query));
    },
    [],
  );

  useEffect(() => {
    setSuggestions(tagsValues.getSuggestions(""));
  }, [tagsValues, updateSuggestions]);

  return (
    <div>
      <div className="mx-2 mt-2 flex items-center gap-2 px-0.5">
        <Input
          ref={inputRef}
          autoFocus
          onChange={(e) => {
            valueRef.current = e.target.value;
            updateSuggestions(e.target.value, tagsValues);
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              void send();
            }
            if (e.key === "ArrowDown") {
              updateSelected(selectedSuggestion + 1);
            }
            if (e.key === "ArrowUp") {
              updateSelected(selectedSuggestion - 1);
            }
          }}
          className="w-full"
        />
        <Button variant="outline" size="icon" onClick={() => send()}>
          <CornerRightUp size={16} />
        </Button>
      </div>

      <ScrollArea className="h-10">
        <ScrollBar orientation="horizontal" />
        <div className="mt-2 flex w-max gap-1 px-2 text-sm">
          {suggestions.map((v, i) => (
            <button
              key={i}
              ref={(el) => {
                if (el) {
                  refMap.current.set(v, el);
                }
              }}
              onClick={() => send(v)}
            >
              <Badge
                className="cursor-pointer"
                variant={i === actualSelected ? "default" : "outline"}
              >
                {v}
              </Badge>
            </button>
          ))}
        </div>
      </ScrollArea>
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
    <>
      <div className="h-[60px] px-2 pt-2">
        <ScrollArea className="flex h-full">
          <div className="flex flex-wrap gap-0.5">
            {values.map((v) => (
              <div
                key={v.recordId}
                className={cn(
                  "flex w-fit max-w-full items-center gap-1 overflow-hidden rounded px-1 text-sm text-nowrap text-ellipsis",
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
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
      <SubInput />
    </>
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
              "max-w-fit overflow-hidden rounded px-1 text-nowrap text-ellipsis",
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
          <div className="relative flex flex-col">
            <div className="top-0 left-0 z-10 flex h-8 w-full items-center justify-between border-b border-neutral-200 px-4 text-sm font-bold dark:border-neutral-800">
              {format(date, "MMM d")}{" "}
              <span className="text-xs font-normal opacity-50">{name}</span>
            </div>
            <div className="flex max-h-[min(60svh,60vh,150px)] flex-col">
              {e}
            </div>
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
