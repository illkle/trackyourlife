import { Fragment, useMemo, useState } from "react";
import { Switch, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import type { IColorHSL, IColorRGB, IColorValue } from "@tyl/db/jsonValidators";
import { clamp } from "@tyl/helpers/animation";
import {
  colorControlDimensions,
  getControlL,
  getControlMaxima,
  getControlXY,
  gg2D,
  ggLinear,
  isHSLControl,
  type ColorControlKey,
} from "@tyl/helpers/color/pickerShared";
import {
  HSLToRGB,
  RGBToHSL,
  findModeColorsFromUserSelect,
  makeColorString,
} from "@tyl/helpers/colorTools";

import { BetterNumberInput } from "@/components/inputs/colors/betterNumberInput";
import { ControllerPoint, ControllerRoot } from "@/components/inputs/colors/dragController";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type SetRGBFn = (v: Partial<IColorRGB>) => void;
type SetHSLFn = (v: Partial<IColorHSL>) => void;

const gradientStyle = (gradient: string): StyleProp<ViewStyle> => {
  return {
    backgroundImage: gradient,
    experimental_backgroundImage: gradient,
  } as unknown as StyleProp<ViewStyle>;
};

const LinearControlBackground = ({
  controlKey,
  rgb,
  hsl,
}: {
  controlKey: ColorControlKey;
  rgb: IColorRGB;
  hsl: IColorHSL;
}) => {
  const gradient = useMemo(() => {
    return ggLinear[controlKey](rgb, hsl);
  }, [controlKey, hsl.h, hsl.l, hsl.s, rgb.b, rgb.g, rgb.r]);

  return <View className="absolute inset-0 h-full w-full" style={gradientStyle(gradient)} />;
};

const TwoDControlBackground = ({
  controlKey,
  rgb,
  hsl,
}: {
  controlKey: ColorControlKey;
  rgb: IColorRGB;
  hsl: IColorHSL;
}) => {
  const gradient = useMemo(() => gg2D[controlKey](rgb, hsl), [controlKey, hsl, rgb]);
  return <View className="absolute inset-0 h-full w-full" style={gradientStyle(gradient)} />;
};

const TripleController = ({
  control,
  derived,
  setRGB,
  setHSL,
  onDerivedChange,
  controlKey,
}: {
  control: { hsl: IColorHSL; rgb: IColorRGB };
  derived: { hsl: IColorHSL; rgb: IColorRGB }[];
  setRGB: SetRGBFn;
  setHSL: SetHSLFn;
  onDerivedChange?: (index: number, v: IColorHSL) => void;
  controlKey: ColorControlKey;
}) => {
  const dims = colorControlDimensions[controlKey];
  const { maxX, maxY, maxL } = getControlMaxima(controlKey);

  const xyValues = getControlXY(controlKey, control.rgb, control.hsl);
  const lValue = getControlL(controlKey, control.rgb, control.hsl);

  const setXY = (x: number, y: number) => {
    if (dims.color === "rgb") {
      setRGB({ [dims.x]: x, [dims.y]: y });
      return;
    }

    setHSL({ [dims.x]: x, [dims.y]: y });
  };

  const setL = (v: number) => {
    if (dims.color === "rgb") {
      setRGB({ [dims.l]: v });
      return;
    }

    setHSL({ [dims.l]: v });
  };

  const setDerivedXY = (index: number, x: number, y: number) => {
    if (!onDerivedChange) return;
    const d = derived[index];
    if (!d) return;

    if (dims.color === "rgb") {
      onDerivedChange(index, RGBToHSL({ ...d.rgb, [dims.x]: x, [dims.y]: y }));
      return;
    }

    onDerivedChange(index, { ...d.hsl, [dims.x]: x, [dims.y]: y });
  };

  const setDerivedL = (index: number, v: number) => {
    if (!onDerivedChange) return;
    const d = derived[index];
    if (!d) return;

    if (dims.color === "rgb") {
      onDerivedChange(index, RGBToHSL({ ...d.rgb, [dims.l]: v }));
      return;
    }

    onDerivedChange(index, { ...d.hsl, [dims.l]: v });
  };

  return (
    <Fragment key={controlKey}>
      <View className="h-40 w-full overflow-hidden rounded-md">
        <TwoDControlBackground controlKey={controlKey} rgb={control.rgb} hsl={control.hsl} />
        <ControllerRoot
          xMax={maxX}
          yMax={maxY}
          className="h-full w-full"
          initialSelectedPointId="primary"
          onEmptySpaceDrag={(v) => setXY(v.x, v.y)}
        >
          <ControllerPoint
            id="primary"
            x={xyValues.x}
            y={xyValues.y}
            style={{ backgroundColor: makeColorString(control.hsl) }}
            onValueChange={(v) => setXY(v.x, v.y)}
          />
          {derived.map((d, i) => {
            const values = getControlXY(controlKey, d.rgb, d.hsl);
            return (
              <ControllerPoint
                key={i}
                id={String(i)}
                x={values.x}
                y={values.y}
                onValueChange={onDerivedChange ? (v) => setDerivedXY(i, v.x, v.y) : undefined}
              />
            );
          })}
        </ControllerRoot>
      </View>

      <View className="h-11 w-full overflow-hidden rounded-md">
        <LinearControlBackground controlKey={controlKey} rgb={control.rgb} hsl={control.hsl} />
        <ControllerRoot
          disableY
          xMax={maxL}
          className="h-full w-full"
          initialSelectedPointId="primary"
          onEmptySpaceDrag={(v) => setL(v.x)}
        >
          <ControllerPoint
            id="primary"
            x={lValue}
            style={{ backgroundColor: makeColorString(control.hsl) }}
            onValueChange={(v) => setL(v.x)}
          />
          {derived.map((d, i) => (
            <ControllerPoint
              key={i}
              id={String(i)}
              x={getControlL(controlKey, d.rgb, d.hsl)}
              onValueChange={onDerivedChange ? (v) => setDerivedL(i, v.x) : undefined}
            />
          ))}
        </ControllerRoot>
      </View>
    </Fragment>
  );
};

export const PickerRGBHSL = ({
  hsl,
  derived = [],
  onChange,
  onDerivedChange,
}: {
  hsl: IColorHSL;
  derived?: IColorHSL[];
  onChange: (v: IColorHSL) => void;
  onDerivedChange?: (index: number, v: IColorHSL) => void;
}) => {
  const rgb = HSLToRGB(hsl);

  const setRGB = (vals: Partial<IColorRGB>) => {
    onChange(RGBToHSL({ ...rgb, ...vals }));
  };

  const setHSL = (vals: Partial<IColorHSL>) => {
    onChange({ ...hsl, ...vals });
  };

  const [controlKey, setControlKey] = useState<ColorControlKey>("hue");
  const inHSL = isHSLControl(controlKey);

  const bniClasses = "h-9 flex-1 rounded-none border-r-0";

  return (
    <View className="gap-0">
      <View className="gap-2">
        <TripleController
          control={{ rgb, hsl }}
          derived={derived.map((d) => ({ rgb: HSLToRGB(d), hsl: d }))}
          setRGB={setRGB}
          setHSL={setHSL}
          onDerivedChange={onDerivedChange}
          controlKey={controlKey}
        />
      </View>

      <View className="mt-2 flex-row">
        <BetterNumberInput
          className={cn(bniClasses, inHSL && "opacity-50", "rounded-l-md")}
          value={rgb.r}
          onChange={(v) => setRGB({ r: clamp(v, 0, 255) })}
          hardLimits
        />
        <BetterNumberInput
          className={cn(bniClasses, inHSL && "opacity-50")}
          value={rgb.g}
          onChange={(v) => setRGB({ g: clamp(v, 0, 255) })}
          hardLimits
        />
        <BetterNumberInput
          className={cn(bniClasses, inHSL && "opacity-50")}
          value={rgb.b}
          onChange={(v) => setRGB({ b: clamp(v, 0, 255) })}
          hardLimits
        />
        <BetterNumberInput
          className={cn(bniClasses, !inHSL && "opacity-50")}
          value={hsl.h}
          limits={{ min: 0, max: 360 }}
          onChange={(v) => setHSL({ h: v })}
          hardLimits
        />
        <BetterNumberInput
          className={cn(bniClasses, !inHSL && "opacity-50")}
          value={hsl.s}
          limits={{ min: 0, max: 100 }}
          onChange={(v) => setHSL({ s: v })}
          hardLimits
        />
        <BetterNumberInput
          className={cn(bniClasses, !inHSL && "opacity-50", "rounded-r-md border-r")}
          value={hsl.l}
          limits={{ min: 0, max: 100 }}
          onChange={(v) => setHSL({ l: v })}
          hardLimits
        />
      </View>

      <Tabs value={controlKey} onValueChange={(v) => setControlKey(v as ColorControlKey)}>
        <TabsList className="h-9 rounded-t-none border border-t-0 border-border p-1">
          <TabsTrigger value="red" text="R" className="px-0" />
          <TabsTrigger value="green" text="G" className="px-0" />
          <TabsTrigger value="blue" text="B" className="px-0" />
          <TabsTrigger value="hue" text="H" className="px-0" />
          <TabsTrigger value="saturation" text="S" className="px-0" />
          <TabsTrigger value="lightness" text="L" className="px-0" />
        </TabsList>
      </Tabs>
    </View>
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

  const setLight = (newLightMode: IColorHSL) => {
    onChange({ darkMode, lightMode: newLightMode, userSelect: newLightMode, manualMode: true });
  };

  const setDark = (newDarkMode: IColorHSL) => {
    onChange({ darkMode: newDarkMode, lightMode, userSelect: newDarkMode, manualMode: true });
  };

  const setBoth = (color: IColorHSL) => {
    onChange({
      ...findModeColorsFromUserSelect(color),
      userSelect: color,
      manualMode: false,
    });
  };

  const [mode, setMode] = useState<"light" | "dark">("light");

  return (
    <View className={cn(className)}>
      <View className="mb-2 min-h-9 flex-row items-center gap-2 self-start rounded-lg bg-muted px-2">
        <Switch
          value={automatic}
          onValueChange={(nextAutomatic) => {
            onChange({ ...value, userSelect: lightMode, manualMode: !nextAutomatic });
          }}
        />
        <Text className="text-xs text-foreground">Auto Contrast</Text>

        {!automatic && (
          <Tabs value={mode} onValueChange={(next) => setMode(next as "light" | "dark")}>
            <TabsList className="h-8 w-auto bg-transparent p-1">
              <TabsTrigger value="light" text="Light" className="px-3" />
              <TabsTrigger value="dark" text="Dark" className="px-3" />
            </TabsList>
          </Tabs>
        )}
      </View>

      {automatic ? (
        <PickerRGBHSL
          hsl={userSelect}
          derived={[lightMode, darkMode]}
          onChange={setBoth}
          onDerivedChange={(_, v) => setBoth(v)}
        />
      ) : mode === "light" ? (
        <PickerRGBHSL hsl={lightMode} onChange={setLight} derived={[darkMode]} />
      ) : (
        <PickerRGBHSL hsl={darkMode} onChange={setDark} derived={[lightMode]} />
      )}
    </View>
  );
};
