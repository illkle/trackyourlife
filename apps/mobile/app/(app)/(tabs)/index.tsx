import { Fragment, useMemo } from "react";
import { Text, View } from "react-native";
import { Link } from "expo-router";
import { eachDayOfInterval, format, isLastDayOfMonth, subDays } from "date-fns";

import { useTrackablesList } from "@tyl/helpers/data/dbHooks";
import { TrackableDataProvider } from "@tyl/helpers/data/TrackableDataProvider";
import { TrackableFlagsProviderExternal } from "@tyl/helpers/data/TrackableFlagsProvider";
import { TrackableGroupsProvider } from "@tyl/helpers/data/TrackableGroupsProvider";
import { TrackableMetaProvider } from "@tyl/helpers/data/TrackableMetaProvider";
import { DefaultWrapper } from "@/lib/styledComponents";
import { Button } from "@/components/ui/button";

const SHOW_DAYS = 7;

const EmptyList = () => {
  return (
    <View className="items-center justify-center py-12">
      <Text className="text-xl font-light text-foreground">You do not have any trackables yet.</Text>
      <Link href="/create" asChild className="mt-4">
        <Button variant="outline" text="Create Trackable" />
      </Link>
    </View>
  );
};

const TodayList = () => {
  const range = useMemo(() => {
    const lastDay = new Date();
    return {
      firstDay: subDays(lastDay, SHOW_DAYS),
      lastDay,
    };
  }, []);

  const q = useTrackablesList({ withData: range });

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: range.firstDay,
        end: range.lastDay,
      }),
    [range],
  );

  if (q.isLoading) {
    return (
      <View className="items-center justify-center py-12">
        <Text className="text-muted-foreground">Loading trackables...</Text>
      </View>
    );
  }

  if (q.error) {
    return (
      <View className="items-center justify-center py-12">
        <Text className="text-destructive">Failed to load trackables.</Text>
      </View>
    );
  }

  if (!q.data || q.data.length === 0) {
    return <EmptyList />;
  }

  return (
    <TrackableFlagsProviderExternal trackablesSelect={q.data}>
      <TrackableDataProvider trackablesSelect={q.data}>
        <TrackableGroupsProvider trackablesSelect={q.data}>
          <View className="flex flex-col gap-6 pb-6">
            {days.map((date, dateIndex) => (
              <Fragment key={date.toISOString()}>
                <View className="flex flex-col gap-3">
                  <View className="flex flex-col gap-1">
                    {(isLastDayOfMonth(date) || dateIndex === 0) && (
                      <Text className="text-2xl font-semibold text-foreground">
                        {format(date, "MMMM")}
                      </Text>
                    )}
                    <View className="flex flex-row items-baseline gap-2">
                      <Text className="text-lg text-muted-foreground">{format(date, "EEEE")}</Text>
                      <Text className="text-lg font-semibold text-foreground">{format(date, "d")}</Text>
                    </View>
                  </View>

                  <View className="flex flex-col gap-2">
                    {q.data.map((trackable) => (
                      <TrackableMetaProvider key={trackable.id} trackable={trackable}>
                        <Link href={`/trackables/${trackable.id}`} className="py-1">
                          <Text className="text-base text-primary">{trackable.name}</Text>
                        </Link>
                      </TrackableMetaProvider>
                    ))}
                  </View>
                </View>
                {dateIndex !== days.length - 1 && <View className="border-b border-border" />}
              </Fragment>
            ))}
          </View>
        </TrackableGroupsProvider>
      </TrackableDataProvider>
    </TrackableFlagsProviderExternal>
  );
};

export const HomeScreen = () => {
  return (
    <DefaultWrapper>
      <TodayList />
    </DefaultWrapper>
  );
};

export default HomeScreen;
