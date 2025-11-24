import React from "react";
import { Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <IconSymbol
          size={28}
          name="house.fill"
          color={Colors[colorScheme ?? "light"].tint}
        />
        <Label>New</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explore">
        <IconSymbol
          size={28}
          name="paperplane.fill"
          color={Colors[colorScheme ?? "light"].tint}
        />
        <Label>Messages</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
