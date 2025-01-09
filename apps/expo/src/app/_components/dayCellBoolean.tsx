import type { ReactNode} from "react";
import { useEffect, useLayoutEffect, useState } from "react";
import type { ViewStyle } from "react-native";
import { Pressable, useColorScheme } from "react-native";
import Animated, { Easing, ZoomIn } from "react-native-reanimated";

import { useDayCellContextBoolean } from "~/app/_components/dayCellProvider";
import { tws } from "~/utils/tw";

const CustomIN = ZoomIn.duration(300).easing(Easing.out(Easing.cubic));

export const DayCellBoolean = ({
  value,
  onChange,
  children,
  style,
}: {
  value?: string;
  onChange?: (v: string) => Promise<void> | void;
  children?: ReactNode;
  style?: ViewStyle;
}) => {
  const [internalValue, setInternalValue] = useState(value);

  useLayoutEffect(() => {
    if (internalValue !== value) {
      setInternalValue(value);
    }
  }, [value]);

  const [animateFrom, setAnimateFrom] = useState({ x: 1, y: 1, real: false });

  const {
    themeActiveDark,
    themeActiveLight,
    themeInactiveDark,
    themeInactiveLight,
  } = useDayCellContextBoolean();
  const isActive = internalValue === "true";

  const colorScheme = useColorScheme();

  const [colorActive, colorInactive] =
    colorScheme === "dark"
      ? [themeActiveDark, themeInactiveDark]
      : [themeActiveLight, themeInactiveLight];

  return (
    <Pressable
      style={[
        {
          overflow: "hidden",
          display: "flex",
          position: "relative",
          flexGrow: 1,
          backgroundColor: isActive ? colorInactive : colorActive,
        },
        style,
      ]}
      onPress={(e) => {
        setAnimateFrom({
          x: Math.round(e.nativeEvent.locationX),
          y: Math.round(e.nativeEvent.locationY),
          real: true,
        });
        setInternalValue(isActive ? "false" : "true");
        if (onChange) {
          onChange(isActive ? "false" : "true");
        }
      }}
    >
      <Animated.View
        key={isActive ? "active" : "inactive"}
        entering={CustomIN}
        style={[
          tws("w-full h-full absolute left-0 top-0 rounded-sm"),
          {
            transformOrigin: animateFrom.real
              ? `${animateFrom.x}px ${animateFrom.y}px`
              : "50% 50%",
            backgroundColor: isActive ? colorActive : colorInactive,
          },
        ]}
      />
      {children}
    </Pressable>
  );
};
