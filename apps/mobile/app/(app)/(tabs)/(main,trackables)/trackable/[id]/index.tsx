import { useLayoutEffect, useMemo } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { eachDayOfInterval, endOfMonth, format, getISODay, startOfMonth, sub } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react-native";

import { Button } from "@/components/ui/button";
import { DayCellRouter } from "@/components/cells";
import { cn } from "@/lib/utils";
import { DefaultWrapper } from "@/lib/styledComponents";
import { TrackableMetaProvider } from "@tyl/helpers/data/TrackableMetaProvider";
import { TrackableDataProvider } from "@tyl/helpers/data/TrackableDataProvider";
import { TrackableFlagsProvider } from "@tyl/helpers/data/TrackableFlagsProvider";
import { useTrackable } from "@tyl/helpers/data/dbHooksTanstack";
import { InstaMount } from "@/lib/FastLoad";

const getIncrementedDate = (add: number, year: number, month: number) => {
  let newMonth = month + add;
  let newYear = year;
  if (newMonth < 0) {
    newMonth = 11;
    newYear = year - 1;
  }

  if (newMonth > 11) {
    newMonth = 0;
    newYear = year + 1;
  }
  return { year: newYear, month: newMonth };
};

const ViewController = ({ year, month }: { year: number; month: number }) => {
  const router = useRouter();
  const monthDate = useMemo(() => new Date(year, month, 1), [month, year]);

  const toPrev = useMemo(() => getIncrementedDate(-1, year, month), [month, year]);
  const toNext = useMemo(() => getIncrementedDate(1, year, month), [month, year]);
  const toToday = useMemo(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }, []);

  const updateParams = (next: { year: number; month: number }) => {
    router.setParams({
      year: String(next.year),
      month: String(next.month),
    });
  };

  return (
    <View className="flex h-10 flex-row items-center justify-between rounded-2xl border border-border">
      <Pressable
        onPress={() => updateParams(toPrev)}
        className="h-full grow items-center justify-center"
      >
        <ChevronLeftIcon color="white" size={20} />
      </Pressable>
      <View className="min-w-30 flex-row items-baseline justify-center gap-2">
        <Text className="text-base font-semibold text-foreground">{format(monthDate, "MMM")}</Text>
        <Text className="text-sm text-muted-foreground">{format(monthDate, "yyyy")}</Text>
      </View>
      <Pressable
        onPress={() => updateParams(toNext)}
        className="h-full grow items-center justify-center"
      >
        <ChevronRightIcon color="white" size={20} />
      </Pressable>
      <Button
        text="Today"
        variant="ghost"
        className="rounded-l-none border-l border-border"
        onPress={() => updateParams(toToday)}
      />
    </View>
  );
};

const TrackableView = () => {
  const { month, year, startOfMonthDate } = useYearMonth();

  return (
    <View className="flex flex-col gap-4 pt-4 pb-6">
      <ViewController year={year} month={month} />

      <InstaMount>
        <MonthVisualCalendar dateFirstDay={startOfMonthDate} />
      </InstaMount>
    </View>
  );
};

const SPACE_BETWEEN_CELLS = 4;

const MonthVisualCalendar = ({ dateFirstDay }: { dateFirstDay: Date }) => {
  const prefaceWith = dateFirstDay ? getISODay(dateFirstDay) - 1 : 0;

  const days = useMemo(
    () => eachDayOfInterval({ start: dateFirstDay, end: endOfMonth(dateFirstDay) }),
    [dateFirstDay],
  );

  const screenWidth = Dimensions.get("window").width - 32; // sub side padding
  const cellWidth = (screenWidth - SPACE_BETWEEN_CELLS * 6) / 7; // sub gap between cells

  return (
    <View
      key={dateFirstDay.toISOString()}
      className={cn("flex flex-row flex-wrap")}
      style={{ gap: SPACE_BETWEEN_CELLS }}
    >
      {Array.from({ length: prefaceWith }).map((_, i) => (
        <View key={i} style={{ width: cellWidth }} className=""></View>
      ))}
      {days.map((el, i) => (
        <DayCellRouter key={i} timestamp={el} labelType={"auto"} style={{ width: cellWidth }} />
      ))}
    </View>
  );
};

export const useYearMonth = () => {
  const params = useLocalSearchParams();
  const monthParam = Array.isArray(params.month) ? params.month[0] : params.month;
  const yearParam = Array.isArray(params.year) ? params.year[0] : params.year;

  const month = useMemo(() => {
    const parsed = Number(monthParam);
    return Number.isInteger(parsed) && parsed >= 0 && parsed <= 11 ? parsed : new Date().getMonth();
  }, [monthParam]);

  const year = useMemo(() => {
    const parsed = Number(yearParam);
    return Number.isInteger(parsed) && parsed > 1900 ? parsed : new Date().getFullYear();
  }, [yearParam]);

  const startOfMonthDate = useMemo(() => startOfMonth(new Date(year, month, 1)), [year, month]);
  const endOfMonthDate = useMemo(() => endOfMonth(new Date(year, month, 1)), [year, month]);

  return {
    month,
    year,
    startOfMonthDate,
    endOfMonthDate,
  };
};

export const TrackableFetcher = () => {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const { startOfMonthDate, endOfMonthDate } = useYearMonth();

  const dataRange = useMemo(
    () => ({
      firstDay: startOfMonth(sub(startOfMonthDate, { months: 7 })),
      lastDay: endOfMonthDate,
    }),
    [endOfMonthDate, startOfMonthDate],
  );

  const q = useTrackable({
    id,
  });

  const navigation = useNavigation();

  const trackable = Array.isArray(q.data) ? q.data[0] : q.data;

  useLayoutEffect(() => {
    if (trackable?.name) {
      navigation.setOptions({
        title: trackable.name,
      });
    }
  }, [navigation, trackable?.name]);

  if (q.isLoading) {
    return (
      <DefaultWrapper noTopSafeArea>
        <View className="items-center justify-center py-12">
          <Text className="text-muted-foreground">Loading trackable...</Text>
        </View>
      </DefaultWrapper>
    );
  }

  if (!q.data) {
    return (
      <DefaultWrapper noTopSafeArea>
        <View className="items-center justify-center py-12">
          <Text className="text-destructive">Trackable not found.</Text>
        </View>
      </DefaultWrapper>
    );
  }

  if (!trackable) {
    return (
      <DefaultWrapper noTopSafeArea>
        <View className="items-center justify-center py-12">
          <Text className="text-destructive">Trackable not found.</Text>
        </View>
      </DefaultWrapper>
    );
  }

  return (
    <DefaultWrapper noTopSafeArea>
      <TrackableMetaProvider trackable={trackable}>
        <TrackableFlagsProvider id={id}>
          <TrackableDataProvider id={id} firstDay={dataRange.firstDay} lastDay={dataRange.lastDay}>
            <TrackableView />
          </TrackableDataProvider>
        </TrackableFlagsProvider>
      </TrackableMetaProvider>
    </DefaultWrapper>
  );
};

export default TrackableFetcher;
