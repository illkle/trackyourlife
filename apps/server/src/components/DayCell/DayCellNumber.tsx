import type React from "react";
import type { CSSProperties } from "react";
import { createContext, forwardRef, useContext, useMemo, useRef } from "react";
import { cn } from "@shad/lib/utils";

import { makeColorString } from "@tyl/helpers/color/colorTools";

import {
  DayCellBaseClasses,
  DayCellBaseClassesFocus,
  LabelInside,
  useDayCellContext,
} from "~/components/DayCell";
import { openDayEditor } from "~/components/Modal/EditorModalV2";
import { useTrackableFlag } from "@tyl/helpers/data/TrackableFlagsProvider";
import { useTrackableMeta } from "~/components/Trackable/TrackableProviders/TrackableProvider";
import { useLinkedValue } from "~/utils/useDbLinkedValue";
import { useIsMobile } from "~/utils/useIsDesktop";

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
  const { id, type, name } = useTrackableMeta();

  const { onChange, labelType, values, timestamp } = useDayCellContext();
  const { value, recordId, updatedAt } = values[0] ?? {};

  const isMobile = useIsMobile();

  return (
    <NumberInputWrapper
      value={value}
      onChange={async (v, ts) => {
        await onChange({ value: v, recordId, updatedAt: ts });
      }}
      onClick={() => {
        if (isMobile) {
          openDayEditor({
            trackable: { id, type, name },
            date: timestamp,
          });
        }
      }}
      updateTimestamp={updatedAt ?? undefined}
      className={cn(
        DayCellBaseClasses,
        DayCellBaseClassesFocus,
        "group items-center justify-center overflow-visible",
        "transition-all ease-in-out",
        "cursor-pointer",
        "border-border/40",
        "data-[empty=false]:border-(--themeLight) dark:data-[empty=false]:border-(--themeDark)",
        "relative",
        "focus-within:border-ring dark:data-[empty=false]:focus-within:border-ring",
      )}
    >
      {labelType === "auto" && <LabelInside />}
      {!isMobile && (
        <NumberInput
          className={cn(...classes, "peer opacity-0 group-hover:opacity-100 focus:opacity-100")}
        />
      )}
      <FormatterFader
        className={cn(
          "absolute top-0 left-0 z-100 h-full w-full",
          ...classes,
          "pointer-events-none",
          !isMobile && "opacity-100 group-hover:opacity-0 peer-focus:opacity-0",
        )}
      />
      <ProgressBar />
    </NumberInputWrapper>
  );
};

const classes = [
  "text-center text-xs font-semibold @[4rem]:text-xl",
  "absolute top-0 left-1/2 z-10 flex h-full w-full -translate-x-1/2 items-center justify-center bg-inherit outline-hidden select-none",
  "text-muted opacity-50",
  "data-[empty=false]:text-foreground",
  "selection:bg-ring/50",
];

const ProgressBar = () => {
  const { internalNumber } = useNumberInputContext();

  const { id } = useTrackableMeta();
  const progressBounds = useTrackableFlag(id, "NumberProgessBounds");

  const progress = progressBounds.map(internalNumber);

  if (!progress) return null;

  return (
    <div
      className={cn("absolute bottom-0 left-0 w-full bg-(--themeLight) dark:bg-(--themeDark)")}
      style={{ height: `${progress}%` }}
    ></div>
  );
};

const FormatterFader = ({ className, ...props }: React.ComponentProps<"div">) => {
  const { internalNumber } = useNumberInputContext();

  const isBigNumber = internalNumber >= 10000;

  const displayedValue = isBigNumber ? NumberFormatter.format(internalNumber) : internalNumber;

  return (
    <div data-empty={internalNumber === 0} {...props} className={cn(className)}>
      {displayedValue}
    </div>
  );
};

const NumberInputContext = createContext<{
  internalNumber: number;
  inputValue: string;
  handleInput: (value: string) => void | Promise<void>;
  onFocus: React.FocusEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
} | null>(null);

export const useNumberInputContext = () => {
  const context = useContext(NumberInputContext);
  if (!context) {
    throw new Error("NumberInputContext not found");
  }
  return context;
};

export const NumberInputWrapper = forwardRef<
  HTMLDivElement,
  Omit<React.ComponentProps<"div">, "onChange"> & {
    value?: string;
    onChange: (value: string, timestamp: number) => void;
    children?: React.ReactNode;
    updateTimestamp?: number;
  }
>(({ value, onChange, children, updateTimestamp: timestamp, ...props }, ref) => {
  const { internalValue, internalValueValidated, updateHandler, reset } = useLinkedValue({
    value: String(getNumberSafe(value)),
    onChange,
    timestamp: timestamp,
    validate: (v) => {
      return !Number.isNaN(Number(v));
    },
  });

  const internalNumber = getNumberSafe(internalValueValidated);

  const useEditing = useRef(false);

  const handleInput = async (value: string) => {
    //
    // This is needed to force decimal points to be "."
    // We need to force them because otherwise decimal input is bugged in safari
    // for people who have a language and region mismatch(i.e region with 30.2 convention an language with 30,2 convention).
    // So ios keyboard might show , as a separator, but browser will say that for value 30,2 valueasnumber is NaN
    // https://github.com/home-assistant/frontend/pull/18268#issuecomment-1769182417
    // For the same reason  input type is set to text, because otherwise it will not allow input with wrong decimal
    //
    const replaced = value.replace(",", ".");
    await updateHandler(replaced);
  };

  const handleInputBlur = () => {
    console.log("handleInputBlur", internalValue, internalValueValidated);
    if (internalValue !== internalValueValidated) {
      reset();
    }
    useEditing.current = false;
  };

  const focusHandler: React.FocusEventHandler<HTMLInputElement> = (e) => {
    useEditing.current = true;
    if (internalNumber === 0) {
      e.target.select();
    }
  };

  const { id } = useTrackableMeta();
  const colorCoding = useTrackableFlag(id, "NumberColorCoding");

  const color = useMemo(() => {
    return colorCoding.valueToColor(internalNumber);
  }, [internalNumber, colorCoding]);

  return (
    <>
      <NumberInputContext.Provider
        value={{
          internalNumber,
          inputValue: internalValue,
          handleInput,
          onFocus: focusHandler,
          onBlur: handleInputBlur,
        }}
      >
        <div
          ref={ref}
          data-number-cell
          data-empty={internalNumber === 0}
          style={
            {
              "--themeLight": makeColorString(color.lightMode),
              "--themeDark": makeColorString(color.darkMode),
            } as CSSProperties
          }
          {...props}
        >
          {children}
        </div>
      </NumberInputContext.Provider>
    </>
  );
});

export const NumberInput = forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "onChange" | "value" | "type" | "inputMode">
>((props, ref) => {
  const { internalNumber, inputValue, onFocus, onBlur, handleInput } = useNumberInputContext();

  return (
    <input
      ref={ref}
      value={inputValue}
      onKeyUp={(e) => {
        if (e.key === "Enter") {
          const target = e.target as HTMLElement;
          target.blur();
        }
        props.onKeyUp?.(e);
      }}
      data-empty={internalNumber === 0}
      onFocus={(e) => {
        onFocus(e);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        onBlur(e);
        props.onBlur?.(e);
      }}
      inputMode={"decimal"}
      type={"text"}
      {...props}
      onChange={(v) => handleInput(v.target.value)}
    />
  );
});
