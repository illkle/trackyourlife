import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function SharedLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerBackground: () => <View className="flex-1 bg-background" />,
      }}
    >
      <Stack.Screen
        name="main"
        options={{ headerShown: false, headerTitle: '' }}
      />
      <Stack.Screen
        name="trackables"
        options={{ headerShown: false, headerTitle: '' }}
      />
      <Stack.Screen
        name="trackable/[id]"
        options={{
          headerShown: true,
          title: 'Trackable',
        }}
      />
      <Stack.Screen
        name="trackable/[id]/settings"
        options={{
          headerShown: true,
          title: 'Trackable settings',
        }}
      />
    </Stack>
  );
}
