import type { ComponentProps } from "react";
import { useEffect } from "react";
import { Loader2Icon } from "lucide-react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { cn } from "@/lib/utils";

export const Spinner = ({ className, ...props }: ComponentProps<typeof Loader2Icon>) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 900,
        easing: Easing.linear,
      }),
      -1,
      false,
    );

    return () => {
      cancelAnimation(rotation);
    };
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Loader2Icon
        accessibilityRole="progressbar"
        accessibilityLabel="Loading"
        className={cn("h-4 w-4", className)}
        {...props}
      />
    </Animated.View>
  );
};
