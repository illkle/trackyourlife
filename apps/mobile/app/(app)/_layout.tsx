import { EditorSheet } from "@/components/edtorSheet";
import { PowerSyncProvider } from "@/db/PowersyncProvider";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
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
      <BottomSheetModalProvider>
        <EditorSheet />
      </BottomSheetModalProvider>
    </PowerSyncProvider>
  );
}
