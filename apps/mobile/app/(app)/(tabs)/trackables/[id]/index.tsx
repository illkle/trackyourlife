import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { format } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react-native";

import { useTrackableMeta } from "@tyl/helpers/data/TrackableMetaProvider";
import { DefaultWrapper } from "@/lib/styledComponents";
import { Button } from "@/components/ui/button";

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
  const params = useLocalSearchParams();
  const monthParam = Array.isArray(params.month) ? params.month[0] : params.month;
  const yearParam = Array.isArray(params.year) ? params.year[0] : params.year;
  const trackable = useTrackableMeta();

  const month = useMemo(() => {
    const parsed = Number(monthParam);
    return Number.isInteger(parsed) && parsed >= 0 && parsed <= 11 ? parsed : new Date().getMonth();
  }, [monthParam]);

  const year = useMemo(() => {
    const parsed = Number(yearParam);
    return Number.isInteger(parsed) && parsed > 1900 ? parsed : new Date().getFullYear();
  }, [yearParam]);

  const monthDate = useMemo(() => new Date(year, month, 1), [month, year]);

  return (
    <View className="flex flex-col gap-4 pt-4 pb-6">
      <ViewController year={year} month={month} />

      <View className="rounded-md border border-border bg-card p-4">
        <Text className="text-sm text-muted-foreground">
          Month view is not implemented yet.
          {trackable.id}
          {monthDate.toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
};

export const TrackableScreen = () => {
  return (
    <DefaultWrapper>
      <TrackableView />
    </DefaultWrapper>
  );
};

export default TrackableScreen;
