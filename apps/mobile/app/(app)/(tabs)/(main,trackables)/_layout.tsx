import { useIconColor } from "@/lib/utils";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { CalendarDaysIcon, SettingsIcon } from "lucide-react-native";
import { Pressable } from "react-native";
import { useCSSVariable } from "uniwind";

const TrackableHeader = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const iconColor = useIconColor();
  const id = params.id as string;
  return (
    <Pressable
      onPress={() => {
        router.replace({ pathname: "/trackable/[id]/settings", params: { id } });
      }}
      className="h-9 w-9 items-center justify-center"
      hitSlop={8}
    >
      <SettingsIcon size={18} color={iconColor} />
    </Pressable>
  );
};

const SettingsHeader = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const iconColor = useIconColor();
  const id = params.id as string;
  return (
    <Pressable
      onPress={() => {
        router.replace({ pathname: "/trackable/[id]", params: { id } });
      }}
      className="h-9 w-9 items-center justify-center"
      hitSlop={8}
    >
      <CalendarDaysIcon size={18} color={iconColor} />
    </Pressable>
  );
};

export default function SharedLayout() {
  const emptyBorder = useCSSVariable("--color-background");

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: emptyBorder as string,
        },
      }}
    >
      <Stack.Screen name="main" options={{ headerShown: false, headerTitle: "" }} />
      <Stack.Screen name="trackables" options={{ headerShown: false, headerTitle: "" }} />
      <Stack.Screen
        name="trackable/[id]"
        options={{
          headerShown: true,
          title: "Trackable",
        }}
      />
      <Stack.Screen
        name="trackable/[id]/settings"
        options={{
          headerShown: true,
          title: "Trackable settings",
        }}
      />
    </Stack>
  );
}
