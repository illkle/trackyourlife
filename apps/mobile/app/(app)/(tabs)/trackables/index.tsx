import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { Link } from "expo-router";
import { format, subDays } from "date-fns";

import { useTrackablesList } from "@tyl/helpers/data/dbHooks";
import { TrackableDataProvider } from "@tyl/helpers/data/TrackableDataProvider";
import { TrackableFlagsProviderExternal } from "@tyl/helpers/data/TrackableFlagsProvider";
import { TrackableGroupsProvider } from "@tyl/helpers/data/TrackableGroupsProvider";
import { TrackableMetaProvider } from "@tyl/helpers/data/TrackableMetaProvider";
import { DefaultWrapper } from "@/lib/styledComponents";
import { Button } from "@/components/ui/button";

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
        <TrackableGroupsProvider trackablesSelect={q.data}>
          <View className="flex flex-col gap-4 pb-6">
            {q.data.map((trackable) => {
              const recordCount = trackable.data?.length ?? 0;
              return (
                <TrackableMetaProvider key={trackable.id} trackable={trackable}>
                  <View className="border-b border-border pb-4">
                    <Link href={`/trackables/${trackable.id}`} className="py-1">
                      <Text className="text-lg font-semibold text-primary">{trackable.name}</Text>
                    </Link>
                    <Text className="text-sm text-muted-foreground">
                      {recordCount} entries from {format(range.firstDay, "MMM d")} -{" "}
                      {format(range.lastDay, "MMM d")}
                    </Text>
                  </View>
                </TrackableMetaProvider>
              );
            })}
          </View>
        </TrackableGroupsProvider>
      </TrackableDataProvider>
    </TrackableFlagsProviderExternal>
  );
};

export const TrackablesScreen = () => {
  const [archived, setArchived] = useState(false);

  return (
    <DefaultWrapper>
      <View className="flex flex-row items-center justify-between pb-4">
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
