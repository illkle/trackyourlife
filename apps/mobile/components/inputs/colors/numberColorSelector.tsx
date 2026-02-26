import type {
  IColorCodingValue,
  IColorCodingValueInput,
  IColorValue,
} from "@tyl/db/jsonValidators";
import { clamp } from "@tyl/helpers/animation";
import {
  clampPointsToRange,
  cloneAndSortColorCoding,
  getActualMax,
  getActualMin,
} from "@tyl/helpers/color/numberColorSelectorShared";
import { getColorAtPosition, makeCssGradient } from "@tyl/helpers/colorTools";
import { PlusCircleIcon, XIcon } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { useUniwind } from "uniwind";

import { BetterNumberInput } from "@/components/inputs/colors/betterNumberInput";
import { ControllerPoint, ControllerRoot } from "@/components/inputs/colors/dragController";
import { cn } from "@/lib/utils";
import { ColorInput } from "@/components/inputs/colors/colorInput";

const makeId = () => `c-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const gradientStyle = (gradient: string): StyleProp<ViewStyle> => {
  return {
    backgroundImage: gradient,
    experimental_backgroundImage: gradient,
  } as unknown as StyleProp<ViewStyle>;
};

const GradientBar = ({
  value,
  min,
  max,
  className,
}: {
  value: IColorCodingValue[];
  min: number;
  max: number;
  className: string;
}) => {
  const { theme } = useUniwind();
  const gradient = useMemo(() => {
    return makeCssGradient(
      [...value].sort((a, b) => a.point - b.point),
      min,
      max,
      theme === "dark" ? "dark" : "light",
      true,
    );
  }, [max, min, theme, value]);

  return <View className={cn("h-full w-full", className)} style={gradientStyle(gradient)} />;
};

const ControllerGradient = ({
  value,
  onChange,
}: {
  value: IColorCodingValue[];
  onChange: (v: IColorCodingValue[]) => void;
}) => {
  const [minValue, setMinValue] = useState<number>(getActualMin(value[0]?.point, 0));
  const [maxValue, setMaxValue] = useState<number>(
    getActualMax(value[value.length - 1]?.point, 100),
  );

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

  useEffect(() => {
    const nextValue = clampPointsToRange({ value, min: minValue, max: maxValue });

    const changed = nextValue.some((v, index) => v.point !== value[index]?.point);
    if (changed) {
      onChange(nextValue);
    }
  }, [maxValue, minValue, onChange, value]);

  const updateColorById = (id: string, color: IColorValue) => {
    onChange([...value].map((v) => (v.id === id ? { ...v, color } : v)));
  };

  return (
    <View>
      <View className="flex-row items-center gap-1">
        <BetterNumberInput
          value={minValue}
          onChange={(n) => {
            setMinValue(Math.min(n, maxValue - 1));
          }}
          className="h-10 w-10 px-1"
        />

        <View className="h-10 grow overflow-hidden rounded-md border border-muted">
          <GradientBar value={value} min={minValue} max={maxValue} className="absolute inset-0" />
          <ControllerRoot
            disableY
            xMin={minValue}
            xMax={maxValue}
            selectedPoint={selectedColor}
            onSelectedPointChange={setSelectedColor}
            onEmptySpaceClick={(v) => addColor(v.x)}
            onDragAway={value.length > 1 ? (id) => removeColor(id) : undefined}
            className="h-full w-full"
          >
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
        </View>

        <BetterNumberInput
          value={maxValue}
          onChange={(n) => {
            setMaxValue(Math.max(n, minValue + 1));
          }}
          className="h-10 w-10 px-1"
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
                <ColorInput value={v.color} onChange={(u) => updateColorById(v.id, u)} />
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
                className={cn(
                  "h-9 w-9 items-center justify-center rounded-md",
                  value.length < 2 && "opacity-30",
                )}
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
  return (
    <ControllerGradient value={value} onChange={(v) => onChange(cloneAndSortColorCoding(v))} />
  );
};
