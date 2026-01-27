import { Stack } from "expo-router";

export const TrackableLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="settings" />
    </Stack>
  );
};

export default TrackableLayout;
