import { PowerSyncProvider } from "@/db/PowersyncProvider";
import { Stack } from "expo-router";

// Auth protected layout
export default function AppLayout() {
  return (
    <PowerSyncProvider>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
      </Stack>
    </PowerSyncProvider>
  );
}
