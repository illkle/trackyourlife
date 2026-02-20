import { useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { Link } from "expo-router";
import { eachDayOfInterval, subDays } from "date-fns";

import { useTrackablesList } from "@tyl/helpers/data/dbHooks";
import { TrackableDataProvider } from "@tyl/helpers/data/TrackableDataProvider";
import { TrackableFlagsProviderExternal } from "@tyl/helpers/data/TrackableFlagsProvider";
import { TrackableMetaProvider } from "@tyl/helpers/data/TrackableMetaProvider";
import { DefaultWrapper } from "@/lib/styledComponents";
import { Button } from "@/components/ui/button";
import DayCellRouter from "@/components/cells";

const SHOW_DAYS = 6;

const TrackableList = ({ archived }: { archived: boolean }) => {
  const range = useMemo(() => {
    const lastDay = new Date();
    return {
      firstDay: subDays(lastDay, SHOW_DAYS - 1),
      lastDay,
    };
  }, []);

  const q = useTrackablesList({ withData: range, showArchived: archived });

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: range.lastDay,
        end: range.firstDay,
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
    return (
      <View className="items-center justify-center py-12">
        <Text className="text-xl font-light text-foreground">
          {archived ? "Archive is empty." : "You do not have any trackables yet."}
        </Text>
        {!archived && (
          <Link href="/create" asChild className="mt-4">
            <Button variant="outline" text="Create Trackable" />
          </Link>
        )}
      </View>
    );
  }

  return (
    <TrackableFlagsProviderExternal trackablesSelect={q.data}>
      <TrackableDataProvider trackablesSelect={q.data}>
        <View className="flex flex-col gap-4 pb-6">
          {q.data.map((trackable) => {
            return (
              <TrackableMetaProvider key={trackable.id} trackable={trackable}>
                <View className="border-b border-border">
                  <Link href={`/trackable/${trackable.id}`} className="px-4 py-1">
                    <Text className="text-lg font-semibold text-primary">{trackable.name}</Text>
                  </Link>
                  <FlatList
                    data={days}
                    renderItem={({ item }) => (
                      <DayCellRouter timestamp={item} labelType={"outside"} className="w-24" />
                    )}
                    horizontal
                    inverted
                    contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 16 }}
                  />
                </View>
              </TrackableMetaProvider>
            );
          })}
        </View>
      </TrackableDataProvider>
    </TrackableFlagsProviderExternal>
  );
};

export const TrackablesScreen = () => {
  const [archived, setArchived] = useState(false);

  return (
    <DefaultWrapper noHorizontalPadding>
      <View className="flex flex-row items-center justify-between px-4 pb-4">
        <Text className="text-2xl font-semibold text-foreground">
          {archived ? "Archive" : "Your Trackables"}
        </Text>
        <Button
          variant="ghost"
          text={archived ? "Trackables" : "Archive"}
          onPress={() => setArchived((prev) => !prev)}
        />
      </View>
      <TrackableList archived={archived} />
    </DefaultWrapper>
  );
};

export default TrackablesScreen;
