import '@azure/core-asynciterator-polyfill'; // required for powersync
import 'react-native-get-random-values'; // required for uuidv4
import 'react-native-reanimated';

import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';

import { KeyboardProvider } from 'react-native-keyboard-controller';
import {
  SafeAreaListener,
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  AuthClientProvider,
  SessionCachedProvider,
  useSessionCached,
} from '@/lib/authClient';
import { PortalHost } from '@rn-primitives/portal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ServerURLProvider, useServerURL } from '@/lib/ServerURLContext';
import { Uniwind, useCSSVariable } from 'uniwind';
import * as SystemUI from 'expo-system-ui';

//import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';

export const unstable_settings = {
  anchor: '(tabs)',
};

//SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const bg = useCSSVariable('--color-background');

  useEffect(() => {
    if (typeof bg === 'string') {
      SystemUI.setBackgroundColorAsync(bg);
    }
  }, [colorScheme, bg]);

  const qc = new QueryClient();

  return (
    <ServerURLProvider>
      <AuthClientProvider>
        <SessionCachedProvider>
          <GestureHandlerRootView>
            <ThemeProvider
              value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
            >
              <QueryClientProvider client={qc}>
                <SafeAreaProvider>
                  <SafeAreaListener
                    onChange={({ insets }) => {
                      Uniwind.updateInsets(insets);
                    }}
                  >
                    <KeyboardProvider>
                      <RootNavigator />
                      <StatusBar style="auto" />
                      <PortalHost />
                    </KeyboardProvider>
                  </SafeAreaListener>
                </SafeAreaProvider>
              </QueryClientProvider>
            </ThemeProvider>
          </GestureHandlerRootView>
        </SessionCachedProvider>
      </AuthClientProvider>
    </ServerURLProvider>
  );
}

const RootNavigator = () => {
  const { serverURL, powersyncURL } = useServerURL();
  const session = useSessionCached();

  const needsToLogin = !session?.data || !serverURL || !powersyncURL;

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
