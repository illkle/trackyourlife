import { MobilePowerSyncProvider } from '@/db/PowersyncProvider';
import { Stack } from 'expo-router';

// Auth protected layout
export default function AppLayout() {
  return (
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
            presentation: 'transparentModal',
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: 'rgba(0,0,0,0.5)' },
          }}
        ></Stack.Screen>
      </Stack>
    </MobilePowerSyncProvider>
  );
}
