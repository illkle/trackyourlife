import { Stack } from "expo-router";

export default function SharedLayout() {
  return (
    <Stack>
      <Stack.Screen name="trackable/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="main" options={{ headerShown: false }} />
      <Stack.Screen name="trackables" options={{ headerShown: false }} />
    </Stack>
  );
}
