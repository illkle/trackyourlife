import { useState } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  LayoutAnimationConfig,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { format, getDaysInMonth, getISODay, startOfMonth } from "date-fns";
import { and, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { CustomDateController } from "~/app/_components/dateController";
import DayCellWrapper from "~/app/_components/dayCell";
import { TrackableProvider } from "~/app/_components/trackableProvider";
import { trackable } from "~/db/schema";
import { db } from "~/drizzle/db";
import { tws } from "~/utils/tw";

const MonthView = ({ date }: { date: Date }) => {
  const d = getDaysInMonth(date);

  const dates = Array(d)
    .fill(0)
    .map((_, i) => i + 1);

  const firstDayDate = startOfMonth(date);
  const prefaceWith = getISODay(firstDayDate) - 1;
  const prepend = Array(prefaceWith).fill(0);
  const { width } = useWindowDimensions();

  const p = 8;
  const gap = 2;
  const w = (width - p * 2 - 6 * gap) / 7;
  const h = 70;

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        width: width,
        height: 300,
        gap: gap,
        padding: p,
      }}
    >
      {prepend.map((_, i) => (
        <View style={[tws(""), { width: w }]} key={i}></View>
      ))}
      {dates.map((el) => (
        <View key={el} style={{ width: w }}>
          <DayCellWrapper
            key={el}
            year={date.getFullYear()}
            month={date.getMonth()}
            day={el}
            size="s"
            style={{ height: h - 20 }}
            styleWrapper={{ height: h }}
            labelType={"outside"}
          />
        </View>
      ))}
    </View>
  );
};

export default function Index() {
  const { trackableId } = useLocalSearchParams<{ trackableId: string }>();

  const { data } = useLiveQuery(
    db.query.trackable.findFirst({
      where: and(eq(trackable.isDeleted, false), eq(trackable.id, trackableId)),
    }),
  );

  const isSelecting = useSharedValue(false);

  const [currentDate, setDate] = useState(new Date(2024, 7, 1));

  const animatedSelection = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isSelecting.value ? 0.2 : 1, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      }),
      transform: [
        {
          translateY: withTiming(isSelecting.value ? 50 : 0, {
            duration: 300,
            easing: Easing.out(Easing.cubic),
          }),
        },
        {
          scale: withTiming(isSelecting.value ? 0.8 : 1, {
            duration: 300,
            easing: Easing.out(Easing.cubic),
          }),
        },
      ],
    };
  });

  if (!data) {
    return (
      <View>
        <Text>No data</Text>
      </View>
    );
  }

  return (
    <>
      <View style={[tws("relative h-full w-full z-20")]}>
        <SafeAreaView edges={["top"]} />

        <Animated.View
          style={[tws(""), { transformOrigin: "bottom" }, animatedSelection]}
        >
          <View
            style={[tws("px-4 py-4 w-full flex flex-row items-baseline gap-2")]}
          >
            <Text style={[tws("font-bold text-color-base text-2xl")]}>
              {format(currentDate, "MMMM")}
            </Text>
            <Text style={[tws(" text-color-base text-xl")]}>
              {format(currentDate, "yyyy")}
            </Text>
          </View>
          <LayoutAnimationConfig skipEntering>
            <TrackableProvider trackable={data}>
              <MonthView date={currentDate} />
            </TrackableProvider>
          </LayoutAnimationConfig>
        </Animated.View>

        <View
          style={[
            tws("absolute bottom-0 w-full flex flex-col justify-center gap-4"),
          ]}
        >
          <CustomDateController
            onChange={setDate}
            onStart={() => (isSelecting.value = true)}
            onEnd={() => (isSelecting.value = false)}
          />
        </View>
      </View>
    </>
  );
}
