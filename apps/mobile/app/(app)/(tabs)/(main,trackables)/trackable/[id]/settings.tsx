import { Text, View } from "react-native";

import { DefaultWrapper } from "@/lib/styledComponents";

export const TrackableSettingsScreen = () => {
  return (
    <DefaultWrapper>
      <View className="flex flex-col gap-4 pb-6">
        <Text className="text-2xl font-semibold text-foreground">Trackable settings</Text>
        <Text className="text-base text-muted-foreground">Settings UI will be added later.</Text>
      </View>
    </DefaultWrapper>
  );
};

export default TrackableSettingsScreen;
