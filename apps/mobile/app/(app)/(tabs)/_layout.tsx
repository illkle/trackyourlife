import React from "react";
import { Platform } from "react-native";
import { Icon, Label, NativeTabs, VectorIcon } from "expo-router/unstable-native-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { useCSSVariable } from "uniwind";

export default function TabLayout() {
  const c = useCSSVariable("--color-primary");
  const activeColor = typeof c === "string" ? c : undefined;

  return (
    <NativeTabs iconColor={{ selected: activeColor }}>
      <NativeTabs.Trigger name="(main)">
        {Platform.select({
          ios: <Icon sf="calendar" />,
          android: <Icon src={<VectorIcon family={MaterialIcons} name="calendar-today" />} />,
        })}
        <Label>Today</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(trackables)">
        {Platform.select({
          ios: <Icon sf="list.bullet" />,
          android: <Icon src={<VectorIcon family={MaterialIcons} name="list" />} />,
        })}
        <Label>Trackables</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="create">
        {Platform.select({
          ios: <Icon sf="plus.circle" />,
          android: <Icon src={<VectorIcon family={MaterialIcons} name="add-circle" />} />,
        })}
        <Label>Create</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        {Platform.select({
          ios: <Icon sf="gear" />,
          android: <Icon src={<VectorIcon family={MaterialIcons} name="settings" />} />,
        })}
        <Label>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
