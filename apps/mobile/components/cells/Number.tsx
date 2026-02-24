import { Pressable, Text } from "react-native";
import { useEffect, useMemo } from "react";
import { useResolveClassNames, useUniwind } from "uniwind";

import { useTrackableMeta } from "@tyl/helpers/data/TrackableMetaProvider";
import { formatNumberShort, getNumberSafe } from "@tyl/helpers/numberTools";
import { cn } from "@/lib/utils";
import { makeColorString } from "@tyl/helpers/colorTools";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useOpenDayEditor } from "@/components/editorModal";
import { DayCellBaseClasses, IDayCellProps, LabelInside } from "@/components/cells/common";
import { useTrackableFlag } from "@tyl/helpers/data/dbHooksTanstack";

export const NumberUI = ({
  value,
  onPress,
  children,
}: {
  value?: string;
  onPress: () => void;
  children: React.ReactNode;
}) => {
  const internalNumber = getNumberSafe(value);
  const { id } = useTrackableMeta();
  const { theme } = useUniwind();
  const { data: colorCoding } = useTrackableFlag(id, "NumberColorCoding");

  const isBigNumber = internalNumber >= 10000;

  const displayedValue = isBigNumber ? formatNumberShort(internalNumber, 0) : internalNumber;
  const progressColor = useMemo(() => {
    const color = colorCoding.valueToColor(internalNumber);
    return makeColorString(theme === "light" ? color.lightMode : color.darkMode);
  }, [colorCoding, internalNumber, theme]);
  const borderColorFrom = useSharedValue(progressColor);
  const borderColorTo = useSharedValue(progressColor);
  const borderColorProgress = useSharedValue(1);

  const emptyBorder = useResolveClassNames("border-border/40");

  const isEmpty = internalNumber === 0;

  useEffect(() => {
    if (borderColorTo.value === progressColor) return;
    borderColorFrom.value = borderColorTo.value;
    borderColorTo.value = progressColor;
    borderColorProgress.value = 0;
    borderColorProgress.value = withTiming(1, { duration: 150 });
  }, [borderColorFrom, borderColorProgress, borderColorTo, progressColor]);

  const animatedBorderStyle = useAnimatedStyle(() => {
    return {
      borderWidth: 2,
      borderColor: isEmpty
        ? emptyBorder.borderColor
        : interpolateColor(
            borderColorProgress.value,
            [0, 1],
            [borderColorFrom.value, borderColorTo.value],
          ),
      opacity: isEmpty ? 0.5 : 1,
    };
  });

  return (
    <>
      <AnimatedPressable
        onPress={onPress}
        className={cn(DayCellBaseClasses, "flex items-center justify-center")}
        style={animatedBorderStyle}
      >
        <ProgressBar internalNumber={internalNumber} color={progressColor} />
        <Text className="text-center text-white">{displayedValue}</Text>
        {children}
      </AnimatedPressable>
    </>
  );
};

export const DayCellNumber = (props: IDayCellProps) => {
  const { labelType, values, timestamp } = props.cellData;
  const { value } = values[0] ?? {};

  const { openDayEditor } = useOpenDayEditor(timestamp);

  return (
    <NumberUI value={value} onPress={openDayEditor}>
      {labelType === "auto" && <LabelInside cellData={props.cellData} />}
    </NumberUI>
  );
};

const ProgressBar = ({ internalNumber, color }: { internalNumber: number; color: string }) => {
  const { id } = useTrackableMeta();
  const { data: progressBounds } = useTrackableFlag(id, "NumberProgessBounds");

  const progress = progressBounds.map(internalNumber);

  const progressValue = useSharedValue(progress ?? 0);
  const colorFrom = useSharedValue(color);
  const colorTo = useSharedValue(color);
  const colorProgress = useSharedValue(1);

  useEffect(() => {
    progressValue.value = withTiming(progress ?? 0, { duration: 150 });
  }, [progress, progressValue]);

  useEffect(() => {
    if (colorTo.value === color) return;
    colorFrom.value = colorTo.value;
    colorTo.value = color;
    colorProgress.value = 0;
    colorProgress.value = withTiming(1, { duration: 150 });
  }, [color, colorFrom, colorProgress, colorTo]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: `${progressValue.value}%`,
      backgroundColor: interpolateColor(
        colorProgress.value,
        [0, 1],
        [colorFrom.value, colorTo.value],
      ),
    };
  });

  if (progress === null) return null;

  return (
    <Animated.View
      pointerEvents="none"
      className={cn("absolute bottom-0 left-0 w-full")}
      style={animatedStyle}
    />
  );
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
