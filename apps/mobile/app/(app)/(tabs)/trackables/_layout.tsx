import { Stack } from "expo-router";
import { View } from "react-native";

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          headerBackground: () => <View className="h-full w-full bg-background" />,
        }}
      />
    </Stack>
  );
}
