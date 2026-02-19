import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";
import { CheckIcon } from "lucide-react-native";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const checkboxIndicatorVariants = cva(
  "h-5 w-5 items-center justify-center rounded border shadow-sm shadow-black/5",
  {
    variants: {
      checked: {
        true: "border-primary bg-primary dark:border-primary",
        false: "border-input bg-background dark:border-input dark:bg-input/30",
      },
      disabled: {
        true: "opacity-50",
        false: "",
      },
    },
    defaultVariants: {
      checked: false,
      disabled: false,
    },
  },
);

type CheckboxProps = Omit<ComponentProps<typeof Pressable>, "onPress"> & {
  checked: boolean;
  label?: string;
  onCheckedChange?: (checked: boolean) => void;
};

export const Checkbox = ({
  checked,
  disabled,
  label,
  className,
  onCheckedChange,
  ...props
}: CheckboxProps) => {
  const isDisabled = Boolean(disabled);

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: isDisabled }}
      className={cn(
        "group flex-row items-center gap-2",
        !isDisabled && "active:opacity-80",
        isDisabled && "opacity-50",
        className,
      )}
      disabled={isDisabled}
      onPress={() => onCheckedChange?.(!checked)}
      {...props}
    >
      <View className={cn(checkboxIndicatorVariants({ checked, disabled: isDisabled }))}>
        {checked ? <CheckIcon size={14} strokeWidth={3} /> : null}
      </View>
      {label ? <Text className="text-sm text-foreground">{label}</Text> : null}
    </Pressable>
  );
};

export type { CheckboxProps };
