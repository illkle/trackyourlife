import { Stack } from "expo-router";
import { useCSSVariable } from "uniwind";

export default function SharedLayout() {
  const emptyBorder = useCSSVariable("--color-background");

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: emptyBorder as string,
        },
      }}
    >
      <Stack.Screen name="main" options={{ headerShown: false, headerTitle: "" }} />
      <Stack.Screen name="trackables" options={{ headerShown: false, headerTitle: "" }} />
      <Stack.Screen
        name="trackable/[id]"
        options={{
          headerShown: true,
          title: "Trackable",
        }}
      />
      <Stack.Screen
        name="trackable/[id]/settings"
        options={{
          headerShown: true,
          title: "Trackable settings",
        }}
      />
    </Stack>
  );
}
