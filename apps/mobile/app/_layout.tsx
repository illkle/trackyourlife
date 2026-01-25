import "@azure/core-asynciterator-polyfill"; // required for powersync
import "react-native-get-random-values"; // required for uuidv4
import "react-native-reanimated";
import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";

import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaListener, SafeAreaProvider } from "react-native-safe-area-context";
import { SplashScreenController } from "@/components/splash";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthClientProvider, useAuthClient } from "@/lib/authClient";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ServerURLProvider, useServerURL } from "@/lib/ServerURLContext";
import { Uniwind } from "uniwind";

import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export const unstable_settings = {
  anchor: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const qc = new QueryClient();

  return (
    <ServerURLProvider>
      <AuthClientProvider>
        <GestureHandlerRootView>
          <BottomSheetModalProvider>
            <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
              <QueryClientProvider client={qc}>
                <SafeAreaProvider>
                  <SafeAreaListener
                    onChange={({ insets }) => {
                      Uniwind.updateInsets(insets);
                    }}
                  >
                    <KeyboardProvider>
                      <RootNavigator />
                      <SplashScreenController />
                      <StatusBar style="auto" />
                      <PortalHost />
                    </KeyboardProvider>
                  </SafeAreaListener>
                </SafeAreaProvider>
              </QueryClientProvider>
            </ThemeProvider>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </AuthClientProvider>
    </ServerURLProvider>
  );
}

const RootNavigator = () => {
  const { serverURL, powersyncURL } = useServerURL();
  const { authClient } = useAuthClient();
  const session = authClient.useSession();

  const needsToLogin = !session.data?.user || !serverURL || !powersyncURL;

  return (
    <Stack>
      <Stack.Protected guard={!needsToLogin}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={needsToLogin}>
        <Stack.Screen name="(sign-in)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
};
