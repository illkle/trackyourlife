import type React from "react";
import type { CSSProperties } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { cn } from "@shad/utils";
import { format } from "date-fns";
import { useIsomorphicLayoutEffect } from "usehooks-ts";

import { throttle } from "@tyl/helpers";
import { makeColorString } from "@tyl/helpers/colorTools";

import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "~/@shad/components/drawer";
import {
  DayCellBaseClasses,
  DayCellBaseClassesFocus,
  LabelInside,
  useDayCellContext,
} from "~/components/DayCell";
import { useTrackableFlags } from "~/components/TrackableProviders/TrackableFlagsProvider";
import { useTrackableMeta } from "~/components/TrackableProviders/TrackableProvider";
import { useIsDesktop } from "~/utils/useIsDesktop";

const getNumberSafe = (v: string | undefined) => {
  if (!v) return 0;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
};

export const NumberFormatter = new Intl.NumberFormat("en-US", {
  compactDisplay: "short",
  notation: "compact",
});

export const DayCellNumber = () => {
  const isDesktop = useIsDesktop();

  const { id } = useTrackableMeta();
  const { getFlag } = useTrackableFlags();
  const colorCoding = getFlag(id, "NumberColorCoding");
  const progressBounds = getFlag(id, "NumberProgessBounds");

  const { onChange, labelType, date, values } = useDayCellContext();
  const { value, recordId } = values[0] ?? {};

  const [internalNumber, setInternalNumber] = useState(() =>
    getNumberSafe(value),
  );
  const internalNumberRef = useRef(internalNumber);
  const [rawInput, setRawInput] = useState<string>(String(internalNumber));

  const [isEditing, setIsEditing] = useState(false);

  const updateInternalNumber = (val: number) => {
    setInternalNumber(val);
    internalNumberRef.current = val;
  };

  useIsomorphicLayoutEffect(() => {
    const numberSafe = getNumberSafe(value);
    if (internalNumber !== numberSafe) {
      updateInternalNumber(numberSafe);
      if (!isEditing) {
        setRawInput(String(numberSafe));
      }
    }
  }, [value]);

  const internalUpdate = (val: number) => {
    updateInternalNumber(val);
    void debouncedUpdateValue();
  };

  const isBigNumber = internalNumber >= 10000;

  const displayedValue = isBigNumber
    ? NumberFormatter.format(internalNumber)
    : internalNumber;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateValue = useCallback(
    throttle(
      () => {
        void onChange(String(internalNumberRef.current), recordId);
      },
      1000,
      { leading: false },
    ),
    [onChange, internalNumberRef],
  );

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    //
    // This is needed to force decimal points to be "."
    // We need to force them because otherwise decimal input is bugged in safari
    // for people who have a language and region mismatch(i.e region with 30.2 convention an language with 30,2 convention).
    // So ios keyboard might show , as a separator, but browser will say that for value 30,2 valueasnumber is NaN
    // https://github.com/home-assistant/frontend/pull/18268#issuecomment-1769182417
    // For the same reason  input type is set to text, because otherwise it will not allow input with wrong decimal
    //
    const replaced = value.replace(",", ".");
    setRawInput(replaced);
    const numeric = Number(replaced);

    if (!Number.isNaN(numeric)) {
      internalUpdate(numeric);
    }
  };

  const handleInputBlur = () => {
    if (String(internalNumber) !== rawInput) {
      setRawInput(String(internalNumber));
    }
    setDrawerOpen(false);
    setIsEditing(false);
    debouncedUpdateValue.flush();
  };

  const progress = progressBounds.map(internalNumber);

  const color = useMemo(() => {
    return colorCoding.valueToColor(internalNumber);
  }, [internalNumber, colorCoding]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const focusHandler: React.FocusEventHandler<HTMLInputElement> = (e) => {
    setIsEditing(true);
    if (internalNumber === 0) {
      e.target.setSelectionRange(0, rawInput.length);
    }
  };

  return (
    <div
      className={cn(
        DayCellBaseClasses,
        DayCellBaseClassesFocus,
        "group items-center justify-center overflow-visible",
        "transition-all ease-in-out",
        "cursor-pointer",
        internalNumber === 0
          ? "border-neutral-200 dark:border-neutral-900"
          : "border-[var(--themeLight)] dark:border-[var(--themeDark)]",
        isEditing && "relative z-20",
      )}
      style={
        {
          "--themeLight": makeColorString(color.lightMode),
          "--themeDark": makeColorString(color.darkMode),
        } as CSSProperties
      }
    >
      {labelType === "auto" && <LabelInside />}

      <div className="absolute top-0 left-0 z-100 hidden -translate-y-full">
        {internalNumber} {rawInput}
      </div>

      {progress !== null && (
        <div
          className={cn(
            "absolute bottom-0 z-1 w-full bg-[var(--themeLight)] dark:bg-[var(--themeDark)]",
          )}
          style={{ height: `${progress}%` }}
        ></div>
      )}

      {isDesktop ? (
        <>
          <input
            inputMode={"decimal"}
            type={"text"}
            value={rawInput}
            className={cn(
              "peer",
              "absolute top-0 left-1/2 z-10 flex h-full w-full -translate-x-1/2 items-center justify-center bg-inherit text-center font-semibold outline-hidden select-none group-hover:opacity-100",
              internalNumber === 0
                ? "text-neutral-200 dark:text-neutral-800"
                : "text-neutral-800 dark:text-neutral-300",
              "text-xs @[4rem]:text-xl",
              "focus:absolute",
              "group-hover:outline-neutral-100 dark:group-hover:outline-neutral-600",
              "focus:outline-neutral-300 focus:group-hover:outline-neutral-300 dark:focus:outline-neutral-400 dark:focus:group-hover:outline-neutral-400",
              "selection:bg-neutral-300 dark:selection:bg-neutral-600",
              !isEditing ? "opacity-0" : "",
            )}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                const target = e.target as HTMLElement;
                target.blur();
              }
            }}
            onFocus={focusHandler}
            onChange={handleInput}
            onBlur={handleInputBlur}
          />
          <div
            className={cn(
              "peer-focused:opacity-0 peer-hover:opacity-0",
              "relative z-5 flex h-full w-full items-center justify-center bg-inherit text-center font-semibold select-none",
              internalNumber === 0
                ? "text-neutral-200 dark:text-neutral-800"
                : "text-neutral-800 dark:text-neutral-300",
              "text-xs @[4rem]:text-lg",
              "overflow-hidden",
              drawerOpen &&
                "outline outline-neutral-300 dark:outline-neutral-600",
            )}
            onClick={() => {
              setIsEditing(true);
            }}
          >
            {displayedValue}
          </div>
        </>
      ) : (
        <Drawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          shouldScaleBackground={false}
          disablePreventScroll={true}
          repositionInputs={false}
        >
          <DrawerTrigger
            className={cn(
              "relative z-10 flex h-full w-full items-center justify-center bg-inherit text-center font-semibold transition-all select-none",
              internalNumber === 0
                ? "text-neutral-200 dark:text-neutral-800"
                : "text-neutral-800 dark:text-neutral-300",
              "text-xs @[4rem]:text-lg",
              "overflow-hidden",
              drawerOpen &&
                "outline outline-neutral-300 dark:outline-neutral-600",
            )}
          >
            {displayedValue}
          </DrawerTrigger>
          <DrawerContent>
            <DrawerTitle>{format(date, "d MMMM yyyy")}</DrawerTitle>
            <div className="p-6">
              <input
                autoFocus={true}
                inputMode={"decimal"}
                type={"text"}
                value={rawInput}
                className={cn(
                  "relative z-10 flex h-full w-full items-center justify-center rounded-sm bg-inherit text-center font-semibold outline-hidden transition-all select-none",
                  internalNumber === 0
                    ? "text-neutral-200 dark:text-neutral-800"
                    : "text-neutral-800 dark:text-neutral-300",
                  "text-2xl",
                  "h-20 focus:outline-neutral-300 dark:focus:outline-neutral-600",
                )}
                onFocus={focusHandler}
                onChange={handleInput}
                onBlur={handleInputBlur}
              />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};
