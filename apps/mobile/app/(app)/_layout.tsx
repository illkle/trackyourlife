import { MobilePowerSyncProvider } from "@/db/PowersyncProvider";
import { Stack } from "expo-router";
import { AppErrorBoundary } from "@/components/error/appErrorBoundary";

// Auth protected layout
export default function AppLayout() {
  return (
    <AppErrorBoundary boundaryName="app-routes">
      <MobilePowerSyncProvider>
        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="editor"
            options={{
              presentation: "transparentModal",
              headerShown: false,
              animation: "fade",
              contentStyle: { backgroundColor: "rgba(0,0,0,0.5)" },
            }}
          ></Stack.Screen>
          <Stack.Screen
            name="inputEditorModal"
            options={{
              presentation: "transparentModal",
              headerShown: false,
            }}
          />
        </Stack>
      </MobilePowerSyncProvider>
    </AppErrorBoundary>
  );
}
