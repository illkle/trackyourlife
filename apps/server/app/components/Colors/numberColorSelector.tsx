import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { cn } from "@shad/utils";
import { PlusCircleIcon, XIcon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import type { IColorCodingValue, IColorValue } from "@tyl/db/jsonValidators";
import { clamp } from "@tyl/helpers";
import { presetsMap } from "@tyl/helpers/colorPresets";
import {
  getColorAtPosition,
  makeColorString,
  makeCssGradient,
} from "@tyl/helpers/colorTools";

import { Button } from "~/@shad/components/button";
import {
  Drawer,
  DrawerContent,
  DrawerMobileTitleProvider,
  DrawerTitle,
  DrawerTrigger,
} from "~/@shad/components/drawer";
import { Input } from "~/@shad/components/input";
import { BetterNumberInput } from "~/components/Colors/betterNumberInput";
import { ColorDisplay } from "~/components/Colors/colorDisplay";
import ColorPicker from "~/components/Colors/colorPicker";
import {
  ControllerPoint,
  ControllerRoot,
} from "~/components/Colors/dragController";
import { useIsMobile } from "~/utils/useIsDesktop";

const getActualMin = (
  firstVal: number | undefined,
  minInput: number | null,
) => {
  if (typeof firstVal !== "number" && typeof minInput !== "number") return 0;

  const a = typeof firstVal === "number" ? firstVal : Infinity;
  const b = typeof minInput === "number" ? minInput : Infinity;
  return Math.min(a, b);
};
const getActualMax = (
  firstVal: number | undefined,
  maxInput: number | null,
) => {
  if (typeof firstVal !== "number" && typeof maxInput !== "number") return 100;

  const a = typeof firstVal === "number" ? firstVal : -Infinity;
  const b = typeof maxInput === "number" ? maxInput : -Infinity;
  return Math.max(a, b);
};

// This can and probably should be refactored and be somewhat unified with a similar controller in color selector
const ControllerGradient = ({
  value,
  onChange,
}: {
  value: IColorCodingValue[];
  onChange: (v: IColorCodingValue[]) => void;
}) => {
  const isMobile = useIsMobile();

  const firstItem = value[0];
  const lastItem = value[value.length - 1];

  const [minValue, setMinValue] = useState<number>(
    getActualMin(value[0]?.point, 0),
  );
  const [maxValue, setMaxValue] = useState<number>(
    getActualMax(value[value.length - 1]?.point, 100),
  );

  const [minInput, setMinInput] = useState(String(minValue));
  const [maxInput, setMaxInput] = useState(String(maxValue));

  const setById = (id: string, point: number) => {
    const newValue = [...value];
    const a = newValue.find((v) => v.id === id);
    if (!a) return;
    a.point = point;
    onChange(newValue);
  };

  const addColor = (x: number) => {
    const newVal = [...value];
    const color = getColorAtPosition({ value, point: x });
    const id = uuidv4();

    newVal.push({ point: x, color, id });
    onChange(newVal);
    setSelectedColor(id);
  };

  const removeColor = (id: string) => {
    const newVal = [...value].filter((v) => v.id !== id);
    setSelectedColor(newVal[0]?.id ?? "");
    onChange(newVal);
  };

  const minMaxInputBlur = () => {
    setMinInput(String(minValue));
    setMaxInput(String(maxValue));
    const r = [...value];

    r.forEach((v) => {
      v.point = clamp(v.point, minValue, maxValue);
    });

    onChange(r);
  };

  const [selectedColor, setSelectedColor] = useState(value[0]?.id ?? null);

  const selectedColorIndex = useMemo(() => {
    return value.findIndex((v) => v.id === selectedColor);
  }, [selectedColor, value]);

  const selectedColorObject = value[selectedColorIndex]?.color;

  const updateSelectedColor = (color: IColorValue) => {
    const newVal = [...value];
    const v = newVal[selectedColorIndex];
    if (!v) throw new Error("No value[selectedColorIndex]");
    newVal[selectedColorIndex] = { ...v, color };

    onChange(newVal);
  };

  return (
    <>
      <div
        className="flex touch-pan-y items-stretch gap-2"
        onTouchStart={(e) => e.preventDefault()}
        style={
          {
            "--gradLight": makeCssGradient(value, minValue, maxValue, "light"),
            "--gradDark": makeCssGradient(value, minValue, maxValue, "dark"),
          } as CSSProperties
        }
      >
        <Input
          warning={firstItem ? minValue > firstItem.point : false}
          error={minInput !== String(minValue)}
          value={minInput}
          type="number"
          onBlur={minMaxInputBlur}
          onChange={(e) => {
            setMinInput(e.target.value);
            const n = e.target.valueAsNumber;
            if (Number.isNaN(n)) return;
            setMinValue(Math.min(n, maxValue - 1));
          }}
          className="w-16 text-center max-sm:w-12 max-sm:p-0"
        />

        <ControllerRoot
          disableY
          xMin={minValue}
          xMax={maxValue}
          selectedPoint={selectedColor}
          onSelectedPointChange={setSelectedColor}
          className={cn(
            "numberColorSelectorGradient cursor w-full cursor-copy",
          )}
          onEmptySpaceClick={!isMobile ? (v) => addColor(v.x) : undefined}
          onDragAway={value.length > 1 ? (id) => removeColor(id) : undefined}
        >
          {value.map((v) => {
            return (
              <ControllerPoint
                key={v.id}
                id={v.id}
                x={v.point}
                style={
                  {
                    "--light": makeColorString(v.color.lightMode),
                    "--dark": makeColorString(v.color.darkMode),
                  } as CSSProperties
                }
                className="bg-[var(--light)] dark:bg-[var(--dark)]"
                onValueChange={(p) => setById(v.id, p.x)}
              />
            );
          })}
        </ControllerRoot>
        <div className="justify-self-end">
          <Input
            warning={lastItem ? lastItem.point > maxValue : false}
            error={maxInput !== String(maxValue)}
            value={maxInput}
            type="number"
            onBlur={minMaxInputBlur}
            onChange={(e) => {
              setMaxInput(e.target.value);
              const n = e.target.valueAsNumber;
              if (Number.isNaN(n)) return;
              setMaxValue(Math.max(n, minValue + 1));
            }}
            className="w-16 text-center max-sm:w-12 max-sm:p-0"
          />
        </div>
      </div>
      <div className="mt-2 flex flex-col-reverse gap-4 sm:flex-row">
        <div className="w-full max-md:hidden">
          {!isMobile && selectedColorObject && (
            <ColorPicker
              value={selectedColorObject}
              onChange={updateSelectedColor}
            />
          )}
        </div>
        <div className="w-full sm:max-w-xs">
          <div className="flex h-fit flex-col gap-2 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
            {value.map((v) => (
              <div
                key={v.id}
                className={cn(
                  "flex items-stretch gap-2 p-2 transition-all",
                  v.id === selectedColor
                    ? "rounded-md bg-neutral-50 shadow dark:bg-neutral-950 dark:shadow-none"
                    : "cursor-pointer",
                )}
                onClick={() => {
                  setSelectedColor(v.id);
                }}
              >
                {isMobile ? (
                  <DrawerMobileTitleProvider title={"Edit color"}>
                    <Drawer handleOnly>
                      <DrawerTrigger className="w-full">
                        <ColorDisplay color={v.color} className="w-full" />
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerTitle />
                        <div className="p-2">
                          <ColorPicker
                            value={v.color}
                            onChange={updateSelectedColor}
                          />
                        </div>
                      </DrawerContent>
                    </Drawer>
                  </DrawerMobileTitleProvider>
                ) : (
                  <ColorDisplay color={v.color} />
                )}
                <BetterNumberInput
                  value={v.point}
                  limits={{ min: minValue, max: maxValue }}
                  onChange={(val) => setById(v.id, val)}
                />
                <Button
                  disabled={value.length < 2}
                  variant={"ghost"}
                  size={"icon"}
                  className="flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    removeColor(v.id);
                  }}
                >
                  <XIcon size={16} />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            className="mt-2 w-full"
            onClick={() => addColor((maxValue - minValue) / 2)}
          >
            <PlusCircleIcon size={16} className="mr-2 opacity-50" />
            Add color
          </Button>
        </div>
      </div>
    </>
  );
};

const NumberColorSelector = ({
  value,
  onChange,
}: {
  value: IColorCodingValue[];
  onChange: (v: NonNullable<IColorCodingValue[]>) => void;
}) => {
  const [innerValue, setInnerValue] = useState(
    value.length
      ? value
      : [
          { point: 0, color: presetsMap.red, id: uuidv4() },
          { point: 100, color: presetsMap.green, id: uuidv4() },
        ],
  );

  const sorted = innerValue.sort((a, b) => a.point - b.point);

  return (
    <ControllerGradient
      value={sorted}
      onChange={(v) => {
        setInnerValue(v);
        onChange(v);
      }}
    />
  );
};

export default NumberColorSelector;
