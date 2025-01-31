import {
  useCallback,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { format } from "date-fns";
import { CornerRightUp, XIcon } from "lucide-react";
import { m } from "motion/react";

import { clamp } from "@tyl/helpers";
import {
  findClosestDarkmode,
  findClosestLightmode,
  stringToColorHSL,
} from "@tyl/helpers/colorTools";

import { Badge } from "~/@shad/components/badge";
import { Button } from "~/@shad/components/button";
import { Input } from "~/@shad/components/input";
import { ScrollArea, ScrollBar } from "~/@shad/components/scroll-area";
import { cn } from "~/@shad/utils";
import { LabelInside, useDayCellContext } from "~/components/DayCell";
import {
  DynamicModal,
  DynamicModalContent,
  DynamicModalDescription,
  DynamicModalDrawerTitle,
  DynamicModalEditorTitle,
  DynamicModalTrigger,
} from "~/components/Modal/dynamicModal";
import { useTheme } from "~/components/Providers/next-themes/themes";
import { useTrackableFlags } from "~/components/TrackableProviders/TrackableFlagsProvider";
import { useTrackableMeta } from "~/components/TrackableProviders/TrackableProvider";

const InputWithSuggestions = ({
  onSubmit,
  getSuggestions,
}: {
  getSuggestions: (v: string) => string[];
  onSubmit: (v: string) => Promise<void>;
}) => {
  const [inputValue, setInputValue] = useState("");
  const inputDeferred = useDeferredValue(inputValue);

  const lastSugestionMove = useRef(1);

  const submit = async (v: string, fromSuggestion?: boolean) => {
    await onSubmit(v);
    setInputValue("");
    if (fromSuggestion) {
      // If we last moved right, we move to next, otherwise we move to previous(but next from our move direction)
      if (lastSugestionMove.current === 1) return;
      updateSelected(lastSugestionMove.current);
    }
  };

  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);

  const suggestions = useMemo(
    () => getSuggestions(inputDeferred),
    [inputDeferred, getSuggestions],
  );
  const refMap = useRef<Map<string, HTMLButtonElement>>(new Map());

  const updateSelected = useCallback(
    (v: number, onlySuggestions?: boolean) => {
      setSelectedSuggestion((prev) =>
        clamp(prev + v, onlySuggestions ? 0 : -1, suggestions.length - 1),
      );
      lastSugestionMove.current = clamp(v, -1, 1);
    },
    [suggestions],
  );

  const activeScrolls = useRef(0);

  useLayoutEffect(() => {
    const sb = clamp(selectedSuggestion, -1, suggestions.length - 1);
    if (selectedSuggestion !== sb) {
      setSelectedSuggestion(sb);
    }
  }, [selectedSuggestion, suggestions]);

  useEffect(() => {
    const target = suggestions[selectedSuggestion];

    if (target) {
      refMap.current.get(target)?.scrollIntoView({
        // 1 is arbitrary, but this seems to work fine both on fast clicks(with animation) and holding key(instant)
        behavior: activeScrolls.current <= 2 ? "smooth" : "auto",
        inline: "center",
        block: "center",
      });
      activeScrolls.current++;
      setTimeout(() => {
        activeScrolls.current--;
        // Again doing some guesswork, but roughly scrollintoview should end in 200ms
      }, 200);
    }
  }, [suggestions, selectedSuggestion]);

  return (
    <div>
      <div className="mx-2 flex items-center gap-2 px-0.5">
        <Input
          value={inputValue}
          autoFocus
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (selectedSuggestion === -1) {
                void submit(inputValue);
              } else {
                void submit(suggestions[selectedSuggestion] ?? "", true);
              }
            }
            if (e.key === "ArrowDown") {
              updateSelected(1);
              e.preventDefault();
            }
            if (e.key === "ArrowUp") {
              updateSelected(-1);
              e.preventDefault();
            }
          }}
          className="w-full"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => submit(inputValue)}
        >
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
              onClick={() => submit(v)}
            >
              <Badge
                className="cursor-pointer duration-0"
                variant={i === selectedSuggestion ? "default" : "outline"}
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

const SubInput = () => {
  const { values, onChange } = useDayCellContext();
  const valuesSet = useMemo(
    () => new Set(values.map((v) => v.value ?? "")),
    [values],
  );

  const { id } = useTrackableMeta();
  const { getFlag, setFlag } = useTrackableFlags();
  const tagsValues = getFlag(id, "TagsValues");

  const getSuggestions = (v: string) => {
    return tagsValues.getSuggestions(v).filter((v) => !valuesSet.has(v));
  };

  const send = async (v: string) => {
    if (!v) return;

    if (!valuesSet.has(v)) {
      await onChange(v, undefined, new Date().getTime());
      await setFlag(id, "TagsValues", tagsValues.addAndReturnArray(v));
    }
  };

  return (
    <InputWithSuggestions onSubmit={send} getSuggestions={getSuggestions} />
  );
};

export const DayCellTagsPopup = () => {
  const { name } = useTrackableMeta();
  const { values, date, labelType, onDelete } = useDayCellContext();

  const { resolvedTheme } = useTheme();

  const longDate = date.getDate() >= 10;

  const [isOpen, setIsOpen] = useState(false);

  const { id } = useTrackableMeta();
  const { getFlag } = useTrackableFlags();
  const monthViewType = getFlag(id, "AnyMonthViewType");

  return (
    <DynamicModal open={isOpen} onOpenChange={setIsOpen}>
      <DynamicModalTrigger
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

                    monthViewType === "calendar"
                      ? "rounded px-1 text-sm text-[9px]"
                      : "rounded-md px-1 text-sm",
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
          </div>
        </ScrollArea>
      </DynamicModalTrigger>
      <DynamicModalContent key={date.getTime()}>
        <DynamicModalDrawerTitle>
          {format(date, "MMMM d")}
        </DynamicModalDrawerTitle>

        <DynamicModalEditorTitle>
          {format(date, "MMMM d")}
          <span className="text-xs font-normal opacity-50">{name}</span>
        </DynamicModalEditorTitle>

        <DynamicModalDescription>{name}</DynamicModalDescription>

        <ScrollArea className="mb-3 flex h-full max-h-[400px] flex-col px-4 md:mr-11 md:mb-0.5">
          <ScrollBar orientation="vertical" />
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 4 }}
            layout
            exit={{ opacity: 0 }}
            className="flex flex-wrap gap-0.5 pt-2 pb-2"
          >
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
          </m.div>
        </ScrollArea>
        <SubInput />
      </DynamicModalContent>
    </DynamicModal>
  );
};

const getStyleHashed = (v: string, theme: string) => {
  const c = stringToColorHSL(v);

  const cc =
    theme === "dark" ? findClosestDarkmode(c) : findClosestLightmode(c);

  return `hsl(${cc.h}, ${cc.s}%, ${cc.l}%)`;
};
