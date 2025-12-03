import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import "react-native-reanimated";
import "@/style/global.css";

import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SplashScreenController } from "@/components/splash";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { authClient } from "@/lib/authClient";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const qc = new QueryClient();

  return (
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
  );
}

const RootNavigator = () => {
  const session = authClient.useSession();

  return (
    <Stack>
      <Stack.Protected guard={!!session.data?.user}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!session.data?.user}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
};
