import type { SharedValue } from "react-native-reanimated";
import { useRef, useState } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  add,
  differenceInCalendarMonths,
  eachMonthOfInterval,
  format,
  isAfter,
  startOfMonth,
  sub,
  subMonths,
} from "date-fns";

import { tws } from "~/utils/tw";

const itemW = 50;

const DateItem = ({
  date,
  currrent,
  fromLeft,
}: {
  date: Date;
  currrent: Date;
  fromLeft: SharedValue<number>;
}) => {
  const v = date;
  const now = new Date();

  const leftStart = differenceInCalendarMonths(v, now) * itemW;
  const leftEnd = leftStart + itemW;

  const isA = isAfter(date, now);

  const isSelected = useDerivedValue(
    () =>
      -fromLeft.value > leftStart - itemW / 2 &&
      -fromLeft.value < leftEnd - itemW / 2,
  );

  const animtedOpacity = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withTiming(isSelected.value ? 1 : 0.9, {
            duration: 300,
            easing: Easing.out(Easing.cubic),
          }),
        },
      ],
      opacity: withTiming(isA ? 0.2 : isSelected.value ? 1 : 0.5, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      }),
    };
  });

  return (
    <Animated.View
      style={[
        tws("absolute", "flex flex-col items-center justify-center"),
        { width: itemW, left: leftStart },
        animtedOpacity,
        { opacity: isAfter(date, now) ? 0.2 : 1 },
      ]}
    >
      <Text style={[tws("text-color-base font-bold text-center ")]}>
        {format(v, "MMM")}
      </Text>

      <Text
        style={[
          tws("text-color-base font-extralight text-center w-10 text-xs"),
        ]}
      >
        {format(v, "yyyy")}
      </Text>
    </Animated.View>
  );
};

const RenderDatesWithPosition = ({
  distance,
  fromLeft,
}: {
  distance: number;
  fromLeft: SharedValue<number>;
}) => {
  const now = new Date();
  const current = startOfMonth(subMonths(now, distance));
  const visible = eachMonthOfInterval({
    start: sub(current, { months: 10 }),
    end: add(current, { months: 10 }),
  });

  return (
    <>
      {visible.map((v, i) => {
        return (
          <DateItem
            key={v.getFullYear() + "-" + v.getMonth()}
            date={v}
            fromLeft={fromLeft}
            currrent={current}
          />
        );
      })}
    </>
  );
};

export const CustomDateController = ({
  onChange,
  onStart,
  onEnd,
}: {
  onChange?: (v: Date) => void;
  onStart?: () => void;
  onEnd?: () => void;
}) => {
  const now = new Date();
  const [distanceFromNow, setDistance] = useState(0);
  const { height, width } = useWindowDimensions();

  const virtualDistance = useRef(0);

  const baseOffset = width / 2 - itemW / 2;

  const pan = Gesture.Pan()
    .onStart(() => {
      onStart && onStart();
    })
    .onChange((v) => {
      fromLeft.value = Math.max(0 - itemW / 2, fromLeft.value + v.changeX);

      const distance = Math.round(fromLeft.value / itemW);

      if (virtualDistance.current !== distance) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      virtualDistance.current = distance;

      if (Math.abs(distance - distanceFromNow) > 10) {
        setDistance(distance);
      }
    })
    .runOnJS(true)
    .onEnd(() => {
      const distance = virtualDistance.current;
      setDistance(distance);

      if (onChange) {
        onChange(subMonths(now, distance));
      }

      const shouldBe = distance * itemW;

      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
      fromLeft.value = withTiming(
        shouldBe,
        {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        },
        () => {},
      );
      onEnd && onEnd();
    });

  const fromLeft = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: fromLeft.value + baseOffset }],
    };
  });

  return (
    <>
      <GestureDetector gesture={pan}>
        <View
          style={[
            tws("flex flex-col justify-center items-center relative"),
            { width },
          ]}
        >
          <View
            style={[
              tws(
                "dark:bg-neutral-50 bg-neutral-950 w-0.5 h-4 absolute left-1/2 -top-4",
              ),
            ]}
          ></View>
          <Animated.View
            style={[
              tws("flex flex-row gap-0 relative w-full h-20"),
              animatedStyles,
            ]}
          >
            <RenderDatesWithPosition
              distance={distanceFromNow}
              fromLeft={fromLeft}
            />
          </Animated.View>
        </View>
      </GestureDetector>
    </>
  );
};
