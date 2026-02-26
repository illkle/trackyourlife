import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { format } from "date-fns";
import { CalendarIcon, XIcon } from "lucide-react-native";

import { getDefaultDatePickerLimits, type DatePickerLimits } from "@tyl/helpers/date/datePicker";

import { cn, useIconColor } from "@/lib/utils";
import { openInputEditorModalDraft } from "@/lib/inputEditorModalStore";

export const DateInput = ({
  value,
  onChange,
  limits,
  disableClear = false,
  title,
  className,
}: {
  value?: Date;
  onChange: (v?: Date, timestamp?: number) => void;
  limits?: DatePickerLimits;
  disableClear?: boolean;
  title?: string;
  className?: string;
}) => {
  const iconColor = useIconColor();
  const resolvedLimits = limits ?? getDefaultDatePickerLimits();

  return (
    <View className={cn("flex-row", className)}>
      <Pressable
        className={cn(
          "h-10 w-42 flex-row items-center gap-2 rounded-md border border-border bg-input/30 px-3",
          !disableClear && "rounded-r-none border-r-0",
        )}
        onPress={() => {
          const draftId = openInputEditorModalDraft({
            kind: "date",
            value,
            onChange,
            limits: resolvedLimits,
            title,
          });

          router.push({
            pathname: "/inputEditorModal",
            params: {
              draftId,
              kind: "date",
            },
          });
        }}
      >
        <Text className="flex-1 text-sm text-foreground">
          {value ? format(value, "d MMMM yyyy") : "No date set"}
        </Text>
        <CalendarIcon size={16} color={iconColor} />
      </Pressable>

      {!disableClear && (
        <Pressable
          className={cn(
            "h-10 w-10 items-center justify-center rounded-r-md border border-border bg-input/30",
            !value && "opacity-40",
          )}
          onPress={() => onChange(undefined)}
          disabled={!value}
        >
          <XIcon size={16} color={iconColor} />
        </Pressable>
      )}
    </View>
  );
};
