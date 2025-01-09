import "@bacons/text-decoder/install";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalHost, PortalProvider } from "@gorhom/portal";
import { useDeviceContext } from "twrnc";

import { tw, tws } from "~/utils/tw";

export default function RootLayout() {
  useDeviceContext(tw);

  return (
    <GestureHandlerRootView>
      <PortalProvider>
        <BottomSheetModalProvider>
          <PortalHost name="rangePortal" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: tws("bg-neutral-50 dark:bg-neutral-950"),
            }}
          />
          <StatusBar />
        </BottomSheetModalProvider>
      </PortalProvider>
    </GestureHandlerRootView>
  );
}
