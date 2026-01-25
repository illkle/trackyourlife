import { useEffect } from "react";
import { Text, View } from "react-native";
import { Stack, useLocalSearchParams, useNavigation } from "expo-router";

import { useTrackable } from "@tyl/helpers/data/dbHooks";
import { TrackableFlagsProviderExternal } from "@tyl/helpers/data/TrackableFlagsProvider";
import { TrackableGroupsProvider } from "@tyl/helpers/data/TrackableGroupsProvider";
import { TrackableMetaProvider } from "@tyl/helpers/data/TrackableMetaProvider";
import { DefaultWrapper } from "@/lib/styledComponents";

export const TrackableLayout = () => {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const q = useTrackable({ id });
  const navigation = useNavigation();

  const trackable = Array.isArray(q.data) ? q.data[0] : q.data;

  useEffect(() => {
    if (trackable?.name) {
      navigation.setOptions({
        title: trackable.name,
      });
    }
  }, [navigation, trackable?.name]);

  if (q.isLoading) {
    return (
      <DefaultWrapper>
        <View className="items-center justify-center py-12">
          <Text className="text-muted-foreground">Loading trackable...</Text>
        </View>
      </DefaultWrapper>
    );
  }

  if (q.error || !q.data) {
    return (
      <DefaultWrapper>
        <View className="items-center justify-center py-12">
          <Text className="text-destructive">Trackable not found.</Text>
        </View>
      </DefaultWrapper>
    );
  }

  if (!trackable) {
    return (
      <DefaultWrapper>
        <View className="items-center justify-center py-12">
          <Text className="text-destructive">Trackable not found.</Text>
        </View>
      </DefaultWrapper>
    );
  }

  return (
    <TrackableFlagsProviderExternal flagsSelect={trackable.flags}>
      <TrackableGroupsProvider groupsSelect={trackable.groups}>
        <TrackableMetaProvider trackable={trackable}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="settings" />
          </Stack>
        </TrackableMetaProvider>
      </TrackableGroupsProvider>
    </TrackableFlagsProviderExternal>
  );
};

export default TrackableLayout;
