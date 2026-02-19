import { Pressable } from "react-native";
import { useLayoutEffect } from "react";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useUniwind } from "uniwind";
import { useTrackableFlag } from "@tyl/helpers/data/TrackableFlagsProvider";
import { useTrackableMeta } from "@tyl/helpers/data/TrackableMetaProvider";
import { DayCellBaseClasses, IDayCellProps, LabelInside } from "@/components/cells/common";
import { cn } from "@/lib/utils";

export const BooleanUI = ({
  value,
  onChange,
  themeActiveLight,
  themeActiveDark,
  themeInactiveLight,
  themeInactiveDark,
  children,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  themeActiveLight: string;
  themeActiveDark: string;
  themeInactiveLight: string;
  themeInactiveDark: string;
  children?: React.ReactNode;
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
      borderColor: interpolateColor(sv.value, [0, 1], [inactiveColor, activeColor]),
    };
  });

  return (
    <Pressable onPress={() => onChange(!value)}>
      <Animated.View className={cn(DayCellBaseClasses, "")} style={animatedStyle}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export const DayCellBoolean = (props: IDayCellProps) => {
  const { id } = useTrackableMeta();

  const { labelType, onChange, values } = props.cellData;
  const { value, id: recordId } = values[0] ?? {};

  const { lightMode: themeActiveLight, darkMode: themeActiveDark } = useTrackableFlag(
    id,
    "BooleanCheckedColor",
  );
  const { lightMode: themeInactiveLight, darkMode: themeInactiveDark } = useTrackableFlag(
    id,
    "BooleanUncheckedColor",
  );

  return (
    <BooleanUI
      value={value === "true"}
      onChange={(v) => void onChange({ value: v ? "true" : "false", recordId })}
      themeActiveLight={themeActiveLight}
      themeActiveDark={themeActiveDark}
      themeInactiveLight={themeInactiveLight}
      themeInactiveDark={themeInactiveDark}
    >
      {labelType === "auto" && <LabelInside cellData={props.cellData} />}
    </BooleanUI>
  );
};
