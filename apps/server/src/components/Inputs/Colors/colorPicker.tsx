import { Fragment, useMemo, useState } from "react";
import { cn } from "@shad/lib/utils";
import { AnimatePresence, m } from "motion/react";

import type { IColorHSL, IColorRGB, IColorValue } from "@tyl/db/jsonValidators";
import { clamp } from "@tyl/helpers/animation";
import {
  findModeColorsFromUserSelect,
  HSLToRGB,
  makeColorString,
  RGBToHSL,
} from "@tyl/helpers/colorTools";

import { Label } from "~/@shad/components/label";
import { Switch } from "~/@shad/components/switch";
import { RadioTabItem, RadioTabs } from "~/@shad/custom/radio-tabs";
import { ControllerPoint, ControllerRoot } from "~/components/Inputs/Colors/dragController";
import { BetterNumberInput } from "./betterNumberInput";

const hueGradient =
  "linear-gradient(to right, rgb(255, 0, 0) 0%, rgb(255, 255, 0) 17%, rgb(0, 255, 0) 33%, rgb(0, 255, 255) 50%, rgb(0, 0, 255) 67%, rgb(255, 0, 255) 83%, rgb(255, 0, 0) 100%)";
const hueGradientDynamic = (s: number, l: number) =>
  `linear-gradient(to right, hsl(0, ${s}%, ${l}%) 0%, hsl(60, ${s}%, ${l}%) 17%, hsl(120, ${s}%, ${l}%)33%, hsl(180, ${s}%, ${l}%) 50%, hsl(240, ${s}%, ${l}%) 67%, hsl(300, ${s}%, ${l}%) 83%, hsl(360, ${s}%, ${l}%) 100%)`;

type IKey = "hue" | "saturation" | "lightness" | "red" | "green" | "blue";

const getMaxValue = (color: "rgb" | "hsl", key: "r" | "g" | "b" | "h" | "s" | "l") => {
  if (color === "rgb") return 255;
  if (key === "h") return 360;
  return 100;
};

type KeysDimensions =
  | {
      color: "rgb";
      x: keyof IColorRGB;
      y: keyof IColorRGB;
      l: keyof IColorRGB;
      key: IKey;
    }
  | {
      color: "hsl";
      x: keyof IColorHSL;
      y: keyof IColorHSL;
      l: keyof IColorHSL;
      key: IKey;
    };

const keysDimensions: Record<IKey, KeysDimensions> = {
  red: { color: "rgb", x: "b", y: "g", l: "r", key: "red" },
  green: { color: "rgb", x: "b", y: "r", l: "g", key: "green" },
  blue: { color: "rgb", x: "g", y: "r", l: "b", key: "blue" },
  hue: { color: "hsl", x: "s", y: "l", l: "h", key: "hue" },
  saturation: { color: "hsl", x: "h", y: "l", l: "s", key: "saturation" },
  lightness: { color: "hsl", x: "h", y: "s", l: "l", key: "lightness" },
};

const gg2D: Record<IKey, (rgb: IColorRGB, hsl: IColorHSL) => string> = {
  red: (rgb, _) =>
    `linear-gradient(to top left, rgb(${rgb.r}, 255, 255), rgba(${rgb.r}, 128, 128, 0), rgb(${rgb.r}, 0, 0)), linear-gradient(to top right, rgb(${rgb.r},255,0), rgba(${rgb.r}, 153, 150, 0), rgb(${rgb.r}, 0, 255)) rgba(${rgb.r}, 153, 150, 1)`,
  green: (rgb, _) =>
    `linear-gradient(to bottom right, rgb(0,${rgb.g},0), rgba(128, ${rgb.g}, 128, 0), rgb(255, ${rgb.g}, 255)), linear-gradient(to bottom left, rgb(0, ${rgb.g}, 255), rgba(150, ${rgb.g}, 150, 0), rgb(255, ${rgb.g}, 0)), rgba(150, ${rgb.g}, 150, 1)`,
  blue: (rgb, _) =>
    `linear-gradient(to bottom right, rgb(0, 0, ${rgb.b}), rgba(128, 128, ${rgb.b}, 0), rgb(255, 255, ${rgb.b})), linear-gradient(to bottom left, rgb(0, 255, ${rgb.b}), rgba(150, 150, ${rgb.b}, 0), rgb(255, 0, ${rgb.b})), rgba(150, 150, ${rgb.b}, 1)`,
  hue: (rgb, hsl) =>
    `linear-gradient(to bottom, black 0%, transparent 50%, white 100%), linear-gradient(to right, hsl(${hsl.h}, 0%, 50%) 0%, hsl(${hsl.h}, 100%, 50%) 100%)`,
  saturation: (rgb, hsl) =>
    `linear-gradient(to bottom, black 0%, transparent 50%, white 100%), ${hueGradientDynamic(hsl.s, 50)}`,
  lightness: (rgb, hsl) =>
    `linear-gradient(to bottom, hsl(0, 0%, ${hsl.l}%) 0%, transparent 100%), ${hueGradientDynamic(100, hsl.l)}`,
};

const ggLinear: Record<IKey, (rgb: IColorRGB, hsl: IColorHSL) => string> = {
  red: (rgb, _) =>
    `linear-gradient(to right, rgb(0,${rgb.g}, ${rgb.b}) 0%, rgb(255,${rgb.g}, ${rgb.b}) 100% )`,
  green: (rgb, _) =>
    `linear-gradient(to right, rgb(${rgb.r}, 0, ${rgb.b}) 0%, rgb(${rgb.r}, 255, ${rgb.b}) 100% )`,
  blue: (rgb, _) =>
    `linear-gradient(to right, rgb(${rgb.r}, ${rgb.g}, 0) 0%, rgb(${rgb.r}, ${rgb.g}, 255) 100% )`,
  hue: () => hueGradient,
  saturation: (rgb, hsl) =>
    `linear-gradient(to right, hsl(${hsl.h}, 0%, ${hsl.l}%) 0%, hsl(${hsl.h}, 100%, ${hsl.l}%) 100% )`,
  lightness: (rgb, hsl) =>
    `linear-gradient(to right, hsl(${hsl.h}, ${hsl.s}%, 0%) 0%, hsl(${hsl.h}, ${hsl.s}%, 100%) 100% )`,
};

const useXYAttrs = (dimensions: KeysDimensions) => {
  const { color, x, y, key } = dimensions;

  const valueGetter = useMemo(
    () =>
      color === "rgb"
        ? (rgb: IColorRGB) => ({ x: rgb[x], y: rgb[y] })
        : (_: IColorRGB, hsl: IColorHSL) => ({ x: hsl[x], y: hsl[y] }),
    [x, y, color],
  );
  const valueSetter = useMemo(
    () => (setRGB: SetRGBFn, setHSL: SetHSLFn) =>
      color === "rgb"
        ? (xV: number, yV: number) => setRGB({ [x]: xV, [y]: yV })
        : (xV: number, yV: number) => setHSL({ [x]: xV, [y]: yV }),
    [color, x, y],
  );

  return {
    maxX: getMaxValue(color, x),
    maxY: getMaxValue(color, y),
    valueGetter,
    valueSetter,
    gradientGetter: gg2D[key],
  };
};

const useLAttrs = (dimensions: KeysDimensions) => {
  const { color, l, key } = dimensions;
  const valueGetter = useMemo(() => {
    if (color === "rgb") return (rgb: IColorRGB) => rgb[l];
    return (_: IColorRGB, hsl: IColorHSL) => hsl[l];
  }, [l, color]);

  const valueSetter = useMemo(
    () => (setRGB: SetRGBFn, setHSL: SetHSLFn) => {
      if (color === "rgb") return (v: number) => setRGB({ [l]: v });
      return (v: number) => setHSL({ [l]: v });
    },
    [l, color],
  );

  return {
    maxVal: getMaxValue(color, l),
    valueGetter,
    valueSetter,
    gradientGetter: ggLinear[key],
  };
};

type SetRGBFn = (v: Partial<IColorRGB>) => void;
type SetHSLFn = (v: Partial<IColorHSL>) => void;

const TripleController = ({
  control,
  derived,
  setRGB,
  setHSL,
  controlKey,
}: {
  control: { hsl: IColorHSL; rgb: IColorRGB };
  derived: { hsl: IColorHSL; rgb: IColorRGB }[];
  setRGB: SetRGBFn;
  setHSL: SetHSLFn;
  controlKey: IKey;
}) => {
  const dims = keysDimensions[controlKey];

  const { maxX, maxY, valueGetter, valueSetter, gradientGetter } = useXYAttrs(dims);

  const {
    maxVal,
    valueGetter: lGetter,
    valueSetter: lSetter,
    gradientGetter: lGradientGetter,
  } = useLAttrs(dims);

  return (
    <Fragment key={controlKey}>
      <ControllerRoot
        xMax={maxX}
        yMax={maxY}
        className="h-36 w-full"
        initialSelectedPointId={"primary"}
        onEmptySpaceDrag={(v) => valueSetter(setRGB, setHSL)(v.x, v.y)}
        style={{ background: gradientGetter(control.rgb, control.hsl) }}
      >
        <ControllerPoint
          id={"primary"}
          {...valueGetter(control.rgb, control.hsl)}
          style={{ background: makeColorString(control.hsl) }}
          onValueChange={(v) => valueSetter(setRGB, setHSL)(v.x, v.y)}
        />
        {derived.map((d, i) => (
          <ControllerPoint key={i} id={String(i)} {...valueGetter(d.rgb, d.hsl)} />
        ))}
      </ControllerRoot>

      <ControllerRoot
        disableY
        xMax={maxVal}
        className="h-10 w-full"
        initialSelectedPointId={"primary"}
        onEmptySpaceDrag={(v) => lSetter(setRGB, setHSL)(v.x)}
        style={{ background: lGradientGetter(control.rgb, control.hsl) }}
      >
        <ControllerPoint
          id={"primary"}
          x={lGetter(control.rgb, control.hsl)}
          style={{ background: makeColorString(control.hsl) }}
          onValueChange={(v) => lSetter(setRGB, setHSL)(v.x)}
        />
        {derived.map((d, i) => (
          <ControllerPoint key={i} id={String(i)} x={lGetter(d.rgb, d.hsl)} />
        ))}
      </ControllerRoot>
    </Fragment>
  );
};

export const PickerRGBHSL = ({
  hsl,
  derived = [],
  onChange,
}: {
  hsl: IColorHSL;
  derived?: IColorHSL[];
  onChange: (v: IColorHSL) => void;
}) => {
  const rgb = HSLToRGB(hsl);

  const setRGB = (vals: Partial<IColorRGB>) => {
    onChange(RGBToHSL({ ...rgb, ...vals }));
  };

  const setHSL = (vals: Partial<IColorHSL>) => {
    onChange({ ...hsl, ...vals });
  };

  const [controlKey, setControlKey] = useState<IKey>("hue");

  const inHSL = controlKey === "hue" || controlKey === "saturation" || controlKey === "lightness";

  const bniClasses = "h-7 rounded-none border border-r-0  transition-opacity";

  const inactiveClasses = "text-muted-foreground/50";

  return (
    <div className="grid gap-x-4">
      <div className="flex flex-col gap-2">
        <TripleController
          control={{ rgb, hsl }}
          derived={derived.map((d) => ({ rgb: HSLToRGB(d), hsl: d }))}
          setRGB={setRGB}
          setHSL={setHSL}
          controlKey={controlKey}
        />
      </div>
      <div className="mt-2 grid grid-cols-6">
        <BetterNumberInput
          className={cn(bniClasses, inHSL && inactiveClasses, "rounded-tl-md")}
          value={rgb.r}
          onChange={(v) => setRGB({ r: clamp(v, 0, 255) })}
          hardLimits
        />
        <BetterNumberInput
          className={cn(bniClasses, inHSL && inactiveClasses)}
          value={rgb.g}
          onChange={(v) => setRGB({ g: clamp(v, 0, 255) })}
          hardLimits
        />
        <BetterNumberInput
          className={cn(bniClasses, inHSL && inactiveClasses)}
          value={rgb.b}
          onChange={(v) => setRGB({ b: clamp(v, 0, 255) })}
          hardLimits
        />
        <BetterNumberInput
          className={cn(bniClasses, !inHSL && inactiveClasses)}
          value={hsl.h}
          limits={{ min: 0, max: 360 }}
          onChange={(v) => setHSL({ h: v })}
          hardLimits
        />
        <BetterNumberInput
          className={cn(bniClasses, !inHSL && inactiveClasses)}
          value={hsl.s}
          limits={{ min: 0, max: 100 }}
          onChange={(v) => setHSL({ s: v })}
          hardLimits
        />
        <BetterNumberInput
          className={cn(bniClasses, !inHSL && inactiveClasses, "rounded-tr-md border-r")}
          value={hsl.l}
          limits={{ min: 0, max: 100 }}
          onChange={(v) => setHSL({ l: v })}
          hardLimits
        />
      </div>
      <RadioTabs
        className="grid h-8 grid-cols-6 gap-1 rounded-t-none border border-t-0 border-border py-1"
        value={controlKey}
        onValueChange={(v) => setControlKey(v as IKey)}
      >
        <RadioTabItem className="text-xs" value="red">
          R
        </RadioTabItem>
        <RadioTabItem className="text-xs" value="green">
          G
        </RadioTabItem>
        <RadioTabItem className="text-xs" value="blue">
          B
        </RadioTabItem>
        <RadioTabItem className="text-xs" value="hue">
          H
        </RadioTabItem>
        <RadioTabItem className="text-xs" value="saturation">
          S
        </RadioTabItem>
        <RadioTabItem className="text-xs" value="lightness">
          L
        </RadioTabItem>
      </RadioTabs>
    </div>
  );
};

export const ColorPicker = ({
  value,
  onChange,
  className,
}: {
  value: IColorValue;
  onChange: (v: IColorValue) => void;
  className?: string;
}) => {
  const automatic = !value.manualMode;
  const { lightMode, darkMode, userSelect } = value;

  const setLight = (lightMode: IColorHSL) => {
    onChange({ darkMode, lightMode, userSelect: lightMode, manualMode: true });
  };

  const setDark = (darkMode: IColorHSL) => {
    onChange({ darkMode, lightMode, userSelect: darkMode, manualMode: true });
  };

  const setBoth = (color: IColorHSL) => {
    onChange({
      ...findModeColorsFromUserSelect(color),
      userSelect: color,
      manualMode: false,
    });
  };

  const [mode, setMode] = useState("light");

  return (
    <div className={className}>
      <m.div
        className={cn(
          "mb-2 flex min-h-8 w-fit items-center gap-2 overflow-hidden rounded-lg bg-muted px-2 text-xs",
        )}
      >
        <Switch
          id="auto-contrast"
          checked={automatic}
          onCheckedChange={(v) => {
            onChange({ ...value, userSelect: lightMode, manualMode: !v });
          }}
        />
        <Label htmlFor="auto-contrast">Auto Contrast</Label>

        <AnimatePresence initial={false}>
          {!automatic && (
            <m.div
              transition={{ duration: 0.33, ease: "easeOut" }}
              layout
              initial={{
                width: 0,
                opacity: 0,
              }}
              animate={{
                width: "auto",
                opacity: 1,
              }}
              exit={{ width: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <RadioTabs
                value={mode}
                onValueChange={setMode}
                className="h-full bg-transparent p-0.5"
              >
                <RadioTabItem className="w-fit" value="light">
                  Light
                </RadioTabItem>
                <RadioTabItem className="w-fit" value="dark">
                  Dark
                </RadioTabItem>
              </RadioTabs>
            </m.div>
          )}
        </AnimatePresence>
      </m.div>

      {automatic ? (
        <PickerRGBHSL hsl={userSelect} derived={[lightMode, darkMode]} onChange={setBoth} />
      ) : mode === "light" ? (
        <PickerRGBHSL hsl={lightMode} onChange={setLight} derived={[darkMode]} />
      ) : (
        <PickerRGBHSL hsl={darkMode} onChange={setDark} derived={[lightMode]} />
      )}
    </div>
  );
};

export default ColorPicker;
