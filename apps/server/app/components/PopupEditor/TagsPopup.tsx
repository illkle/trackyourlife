import {
  useCallback,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CornerRightUp, XIcon } from "lucide-react";

import { clamp } from "@tyl/helpers";
import { getTagStyleHashed } from "@tyl/helpers/trackables";

import type { PopupEditorProps } from "~/components/PopupEditor";
import { Badge } from "~/@shad/components/badge";
import { Button } from "~/@shad/components/button";
import { Input } from "~/@shad/components/input";
import { ScrollArea, ScrollBar } from "~/@shad/components/scroll-area";
import { cn } from "~/@shad/utils";
import { useTheme } from "~/components/Providers/next-themes/themes";
import {
  useSetTrackableFlag,
  useTrackableFlag,
} from "~/components/Trackable/TrackableProviders/TrackableFlagsProvider";
import { useTrackableMeta } from "~/components/Trackable/TrackableProviders/TrackableProvider";

export const TagsPopupEditor = ({
  data,
  onChange,
  onDelete,
}: PopupEditorProps) => {
  const { resolvedTheme } = useTheme();

  const values = data.values;

  const valuesSet = useMemo(
    () => new Set(values.map((v) => v.value)),
    [values],
  );

  const { id } = useTrackableMeta();
  const tagsValues = useTrackableFlag(id, "TagsValues");
  const setFlag = useSetTrackableFlag();

  const getSuggestions = (v: string) => {
    return tagsValues.getSuggestions(v).filter((v) => !valuesSet.has(v));
  };

  const send = async (v: string) => {
    if (!v) return;

    if (!valuesSet.has(v)) {
      await onChange(v, undefined, Date.now());
      await setFlag(id, "TagsValues", tagsValues.addAndReturnArray(v));
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-0.5 pt-2 pb-2">
        {values.map((v) => (
          <div
            key={v.recordId}
            className={cn(
              "flex w-fit max-w-full items-center gap-1 overflow-hidden rounded px-1 text-sm text-nowrap text-ellipsis",
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
      <InputWithSuggestions onSubmit={send} getSuggestions={getSuggestions} />
    </>
  );
};

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
    <div className="sticky bottom-0 bg-neutral-100 pt-2 dark:bg-neutral-950">
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
