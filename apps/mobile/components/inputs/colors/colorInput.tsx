import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ChevronDownIcon } from "lucide-react-native";

import type { IColorValue } from "@tyl/db/jsonValidators";
import { presetsMap } from "@tyl/helpers/colorTools";

import { ColorDisplay } from "@/components/inputs/colors/colorDisplay";
import { ColorPicker } from "@/components/inputs/colors/colorPicker";

export const ColorInput = ({
  value = presetsMap.neutral,
  onChange,
}: {
  value?: IColorValue;
  onChange: (v: IColorValue, timestamp?: number) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <View className="gap-3">
      <Pressable
        className="h-9 w-36 flex-row items-center gap-2"
        onPress={() => {
          setOpen((v) => !v);
        }}
      >
        <ColorDisplay color={value} className="h-9 flex-1" />
        <ChevronDownIcon
          size={16}
          color="#6b7280"
          style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
        />
      </Pressable>

      {open && (
        <View className="rounded-md border border-border bg-card p-3">
          <Text className="mb-2 text-xs text-muted-foreground">Color picker</Text>
          <ColorPicker
            value={value}
            onChange={(next) => {
              onChange(next);
            }}
          />
        </View>
      )}
    </View>
  );
};
