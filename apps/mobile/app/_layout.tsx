import "@azure/core-asynciterator-polyfill";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";

import "react-native-reanimated";
import "@/style/global.css";

import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SplashScreenController } from "@/components/splash";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthClientProvider, useAuthClient } from "@/lib/authClient";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ServerURLProvider, useServerURL } from "@/lib/ServerURLContext";
import * as SplashScreen from "expo-splash-screen";

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
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <QueryClientProvider client={qc}>
            <SafeAreaProvider>
              <KeyboardProvider>
                <RootNavigator />
                <SplashScreenController />
                <StatusBar style="auto" />
                <PortalHost />
              </KeyboardProvider>
            </SafeAreaProvider>
          </QueryClientProvider>
        </ThemeProvider>
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
