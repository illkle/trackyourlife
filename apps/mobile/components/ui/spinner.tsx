import type { ComponentProps } from "react";
import { useEffect } from "react";
import { Loader2Icon } from "lucide-react-native";
import { useResolveClassNames } from "uniwind";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { cn } from "@/lib/utils";

type SpinnerProps = ComponentProps<typeof Loader2Icon> & {
  colorClassName?: string;
  invertedColorClassName?: string;
  inverted?: boolean;
};

export const Spinner = ({
  className,
  colorClassName = "text-foreground",
  invertedColorClassName = "text-background",
  inverted = false,
  color,
  ...props
}: SpinnerProps) => {
  const rotation = useSharedValue(0);
  const resolvedColor = useResolveClassNames(inverted ? invertedColorClassName : colorClassName);

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
        color={color ?? resolvedColor.color}
        {...props}
      />
    </Animated.View>
  );
};
