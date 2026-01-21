import { Pressable } from "react-native";
import { useEffect, useLayoutEffect } from "react";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useUniwind } from "uniwind";

export const CellBoolean = ({
  value,
  onChange,
  themeActiveLight,
  themeActiveDark,
  themeInactiveLight,
  themeInactiveDark,
  labelType = "auto",
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  themeActiveLight: string;
  themeActiveDark: string;
  themeInactiveLight: string;
  themeInactiveDark: string;
  labelType?: "auto" | "outside" | "none";
}) => {
  const sv = useSharedValue(value ? 1 : 0);
  const { theme } = useUniwind();

  const activeColor = theme === "light" ? themeActiveLight : themeActiveDark;
  const inactiveColor = theme === "light" ? themeInactiveLight : themeInactiveDark;

  useLayoutEffect(() => {
    sv.value = withTiming(value ? 1 : 0, { duration: 100 });
  }, [value, sv]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(sv.value, [0, 1], [inactiveColor, activeColor]),
      borderColor: interpolateColor(sv.value, [0, 1], [activeColor, inactiveColor]),
    };
  });

  return (
    <Pressable onPress={() => onChange(!value)}>
      <Animated.View
        className="h-40 w-full rounded-xs border-2"
        style={animatedStyle}
      ></Animated.View>
    </Pressable>
  );
};
