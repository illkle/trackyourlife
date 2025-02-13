import type React from "react";
import type { CSSProperties } from "react";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@shad/utils";
import { useIsomorphicLayoutEffect } from "usehooks-ts";

import { throttle } from "@tyl/helpers";
import { makeColorString } from "@tyl/helpers/colorTools";

import {
  DayCellBaseClasses,
  DayCellBaseClassesFocus,
  LabelInside,
  useDayCellContext,
} from "~/components/DayCell";
import { openDayEditor } from "~/components/EditorModalV2";
import { useTrackableFlag } from "~/components/Trackable/TrackableProviders/TrackableFlagsProvider";
import { useTrackableMeta } from "~/components/Trackable/TrackableProviders/TrackableProvider";
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
  const { id } = useTrackableMeta();
  const colorCoding = useTrackableFlag(id, "NumberColorCoding");

  const { onChange, labelType, values } = useDayCellContext();
  const { value, recordId } = values[0] ?? {};

  const internalNumber = 0;

  const color = useMemo(() => {
    return colorCoding.valueToColor(internalNumber);
  }, [internalNumber, colorCoding]);

  const isMobile = useIsMobile();

  return (
    <NumberInputWrapper
      value={value}
      onChange={async (v) => {
        await onChange(v, recordId);
      }}
      onClick={() => {
        if (isMobile) {
          openDayEditor({
            trackableId: id,
            date: new Date(),
          });
        }
      }}
      className={cn(
        DayCellBaseClasses,
        DayCellBaseClassesFocus,
        "group items-center justify-center overflow-visible",
        "transition-all ease-in-out",
        "cursor-pointer",
        "border-neutral-200 dark:border-neutral-900",
        "data-[empty=false]:border-[var(--themeLight)] dark:data-[empty=false]:border-[var(--themeDark)]",
        "relative",
        "focus-within:border-neutral-300 dark:focus-within:border-neutral-600 dark:data-[empty=false]:focus-within:border-neutral-600",
      )}
      style={
        {
          "--themeLight": makeColorString(color.lightMode),
          "--themeDark": makeColorString(color.darkMode),
        } as CSSProperties
      }
    >
      {labelType === "auto" && <LabelInside />}
      {!isMobile && (
        <NumberInput
          className={cn(
            ...classes,
            "peer opacity-0 group-hover:opacity-100 focus:opacity-100",
          )}
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
  "text-neutral-200 dark:text-neutral-800",
  "data-[empty=false]:text-neutral-800 dark:data-[empty=false]:text-neutral-300",
  "selection:bg-neutral-300 dark:selection:bg-neutral-600",
];

const ProgressBar = () => {
  const { internalNumber } = useNumberInputContext();

  const { id } = useTrackableMeta();
  const progressBounds = useTrackableFlag(id, "NumberProgessBounds");
  const progress = progressBounds.map(internalNumber);

  if (!progress) return null;

  return <div className={cn("")} style={{ height: `${progress}%` }}></div>;
};

const FormatterFader = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const { internalNumber } = useNumberInputContext();

  const isBigNumber = internalNumber >= 10000;

  const displayedValue = isBigNumber
    ? NumberFormatter.format(internalNumber)
    : internalNumber;

  return (
    <div data-empty={internalNumber === 0} {...props} className={cn(className)}>
      {displayedValue}
    </div>
  );
};

const NumberInputContext = createContext<{
  internalNumber: number;
  updateValue: (value: string) => void;
  onFocus: React.FocusEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  rawInput: string;
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
    onChange: (value: string) => void;
    children?: React.ReactNode;
  }
>(({ value, onChange, children, ...props }, ref) => {
  const [internalNumber, setInternalNumber] = useState(() =>
    getNumberSafe(value),
  );
  const internalNumberRef = useRef(internalNumber);
  const [rawInput, setRawInput] = useState<string>(String(internalNumber));

  const useEditing = useRef(false);

  const updateInternalNumber = (val: number) => {
    setInternalNumber(val);
    internalNumberRef.current = val;
  };

  useIsomorphicLayoutEffect(() => {
    const numberSafe = getNumberSafe(value);
    if (internalNumber !== numberSafe) {
      updateInternalNumber(numberSafe);
      if (!useEditing.current) {
        setRawInput(String(numberSafe));
      }
    }
  }, [value]);

  const internalUpdate = (val: number) => {
    updateInternalNumber(val);
    void debouncedUpdateValue();
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateValue = useCallback(
    throttle(
      () => {
        void onChange(String(internalNumberRef.current));
      },
      300,
      { leading: false },
    ),
    [onChange, internalNumberRef],
  );

  const handleInput = (value: string) => {
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
    useEditing.current = false;
    debouncedUpdateValue.flush();
  };

  const focusHandler: React.FocusEventHandler<HTMLInputElement> = (e) => {
    useEditing.current = true;
    if (internalNumber === 0) {
      e.target.select();
    }
  };

  return (
    <>
      <NumberInputContext.Provider
        value={{
          internalNumber,
          rawInput,
          updateValue: handleInput,
          onFocus: focusHandler,
          onBlur: handleInputBlur,
        }}
      >
        <div ref={ref} data-empty={internalNumber === 0} {...props}>
          {children}
        </div>
      </NumberInputContext.Provider>
    </>
  );
});

export const NumberInput = forwardRef<
  HTMLInputElement,
  Omit<
    React.ComponentProps<"input">,
    "onChange" | "value" | "type" | "inputMode"
  >
>((props, ref) => {
  const { internalNumber, rawInput, onFocus, onBlur, updateValue } =
    useNumberInputContext();

  return (
    <input
      ref={ref}
      value={rawInput}
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
      onChange={(v) => updateValue(v.target.value)}
    />
  );
});
