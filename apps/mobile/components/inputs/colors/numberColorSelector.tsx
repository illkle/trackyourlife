import type { IColorCodingValue, IColorCodingValueInput, IColorValue } from "@tyl/db/jsonValidators";
import { clamp } from "@tyl/helpers/animation";
import { makeColorCodingStops } from "@tyl/helpers/color/pickerShared";
import {
  clampPointsToRange,
  cloneAndSortColorCoding,
  getActualMax,
  getActualMin,
} from "@tyl/helpers/color/numberColorSelectorShared";
import { getColorAtPosition } from "@tyl/helpers/colorTools";
import { PlusCircleIcon, XIcon } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Defs, LinearGradient as SvgLinearGradient, Rect, Stop } from "react-native-svg";
import { useUniwind } from "uniwind";

import { BetterNumberInput } from "@/components/inputs/colors/betterNumberInput";
import { ColorDisplay } from "@/components/inputs/colors/colorDisplay";
import { ColorPicker } from "@/components/inputs/colors/colorPicker";
import { ControllerPoint, ControllerRoot } from "@/components/inputs/colors/dragController";
import { cn } from "@/lib/utils";

const makeId = () => `c-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const GradientBar = ({
  value,
  min,
  max,
}: {
  value: IColorCodingValue[];
  min: number;
  max: number;
}) => {
  const id = useMemo(() => Math.random().toString(36).slice(2), []);
  const { theme } = useUniwind();
  const stops = useMemo(() => {
    return makeColorCodingStops({
      values: [...value].sort((a, b) => a.point - b.point),
      min,
      max,
      mode: theme === "dark" ? "dark" : "light",
    });
  }, [max, min, theme, value]);

  return (
    <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
      <Defs>
        <SvgLinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          {stops.map((stop, index) => (
            <Stop key={`${index}-${stop.offset}`} offset={`${stop.offset * 100}%`} stopColor={stop.color} />
          ))}
        </SvgLinearGradient>
      </Defs>
      <Rect x={0} y={0} width={100} height={100} fill={stops.length ? `url(#${id})` : "transparent"} />
    </Svg>
  );
};

const ControllerGradient = ({
  value,
  onChange,
}: {
  value: IColorCodingValue[];
  onChange: (v: IColorCodingValue[]) => void;
}) => {
  const [minValue, setMinValue] = useState<number>(getActualMin(value[0]?.point, 0));
  const [maxValue, setMaxValue] = useState<number>(getActualMax(value[value.length - 1]?.point, 100));

  const setById = (id: string, point: number) => {
    const nextValue = [...value];
    const target = nextValue.find((v) => v.id === id);
    if (!target) return;
    target.point = clamp(point, minValue, maxValue);
    onChange(nextValue);
  };

  const [selectedColor, setSelectedColor] = useState<string | null>(value[0]?.id ?? null);

  const addColor = (x: number) => {
    const nextValue = [...value];
    const color = getColorAtPosition({ value, point: x });
    const id = makeId();

    nextValue.push({ point: x, color, id });
    onChange(nextValue);
    setSelectedColor(id);
  };

  const removeColor = (id: string) => {
    const nextValue = [...value].filter((v) => v.id !== id);
    setSelectedColor(nextValue[0]?.id ?? null);
    onChange(nextValue);
  };

  const selectedColorIndex = useMemo(() => {
    return value.findIndex((v) => v.id === selectedColor);
  }, [selectedColor, value]);

  const selectedColorObject = value[selectedColorIndex]?.color;

  useEffect(() => {
    const nextValue = clampPointsToRange({ value, min: minValue, max: maxValue });

    const changed = nextValue.some((v, index) => v.point !== value[index]?.point);
    if (changed) {
      onChange(nextValue);
    }
  }, [maxValue, minValue, onChange, value]);

  const updateSelectedColor = (color: IColorValue) => {
    const nextValue = [...value];
    const v = nextValue[selectedColorIndex];
    if (!v) return;
    nextValue[selectedColorIndex] = { ...v, color };
    onChange(nextValue);
  };

  return (
    <View>
      <View className="flex-row items-stretch gap-2">
        <BetterNumberInput
          value={minValue}
          onChange={(n) => {
            setMinValue(Math.min(n, maxValue - 1));
          }}
          className="w-16"
          limits={{ min: -1000000000, max: 1000000000 }}
        />

        <ControllerRoot
          disableY
          xMin={minValue}
          xMax={maxValue}
          selectedPoint={selectedColor}
          onSelectedPointChange={setSelectedColor}
          className="h-10 w-full"
          onEmptySpaceClick={(v) => addColor(v.x)}
          onDragAway={value.length > 1 ? (id) => removeColor(id) : undefined}
        >
          <View pointerEvents="none" className="absolute inset-0">
            <GradientBar value={value} min={minValue} max={maxValue} />
          </View>
          {value.map((v) => (
            <ControllerPoint
              key={v.id}
              id={v.id}
              x={v.point}
              style={{
                backgroundColor: v.color.userSelect
                  ? `hsl(${v.color.userSelect.h}, ${v.color.userSelect.s}%, ${v.color.userSelect.l}%)`
                  : undefined,
              }}
              onValueChange={(p) => setById(v.id, p.x)}
            />
          ))}
        </ControllerRoot>

        <BetterNumberInput
          value={maxValue}
          onChange={(n) => {
            setMaxValue(Math.max(n, minValue + 1));
          }}
          className="w-16"
          limits={{ min: -1000000000, max: 1000000000 }}
        />
      </View>

      <View className="mt-2 gap-3">
        <View className="gap-2 rounded-lg bg-muted p-1">
          {value.map((v) => (
            <Pressable
              key={v.id}
              className={cn(
                "flex-row items-center gap-2 p-2",
                v.id === selectedColor ? "rounded-md bg-background" : "",
              )}
              onPress={() => {
                setSelectedColor(v.id);
              }}
            >
              <View className="h-9 flex-1">
                <ColorDisplay color={v.color} className="h-full" />
              </View>
              <BetterNumberInput
                value={v.point}
                limits={{ min: minValue, max: maxValue }}
                onChange={(val) => setById(v.id, val)}
                className="w-20"
              />
              <Pressable
                disabled={value.length < 2}
                onPress={() => {
                  removeColor(v.id);
                }}
                className={cn("h-9 w-9 items-center justify-center rounded-md", value.length < 2 && "opacity-30")}
              >
                <XIcon size={16} color="#6b7280" />
              </Pressable>
            </Pressable>
          ))}
        </View>

        <Pressable
          className="h-10 flex-row items-center justify-center gap-2 rounded-md border border-border bg-background"
          onPress={() => addColor((maxValue - minValue) / 2 + minValue)}
        >
          <PlusCircleIcon size={16} color="#6b7280" />
          <Text className="text-foreground">Add color</Text>
        </Pressable>

        {selectedColorObject && (
          <View className="rounded-lg border border-border p-2">
            <ColorPicker value={selectedColorObject} onChange={updateSelectedColor} />
          </View>
        )}
      </View>
    </View>
  );
};

export const NumberColorSelector = ({
  value,
  onChange,
}: {
  value: IColorCodingValueInput[];
  onChange: (v: NonNullable<IColorCodingValueInput[]>) => void;
}) => {
  return <ControllerGradient value={value} onChange={(v) => onChange(cloneAndSortColorCoding(v))} />;
};
