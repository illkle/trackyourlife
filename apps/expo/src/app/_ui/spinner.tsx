import React from "react";
import type { ViewStyle } from "react-native";
import { Image, useColorScheme, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import SpinnerBlack from "@assets/spinner-black.png";
import SpinnerWhite from "@assets/spinner-white.png";

import { tw, tws } from "~/utils/tw";

const colors = {
  primary: {
    light: SpinnerBlack,
    dark: SpinnerWhite,
  },
  secondary: {
    light: SpinnerWhite,
    dark: SpinnerBlack,
  },
};

export type ISpinnerColor = keyof typeof colors;

export default function Spinner({
  width = 50,
  color = "primary",
  style,
}: {
  width?: number;
  color?: ISpinnerColor;
  style?: ViewStyle;
}) {
  const randomWidth = useSharedValue(0);

  const config = {
    duration: 1000,
    easing: Easing.linear,
  };

  React.useEffect(() => {
    randomWidth.value = withRepeat(withTiming(1, config), 100);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${randomWidth.value * 360}deg` }],
    };
  });

  const colorScheme = useColorScheme();

  return (
    <View style={tws("flex h-full w-full items-center justify-center", style)}>
      <Animated.View
        style={[
          {
            transformOrigin: "center center",
            width,
            height: width,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          },
          animatedStyle,
        ]}
      >
        <Image
          source={colors[color][colorScheme ?? "light"]}
          style={{ width, resizeMode: "contain", display: "flex" }}
        />
      </Animated.View>
    </View>
  );
}
