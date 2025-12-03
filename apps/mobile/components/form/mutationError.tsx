import { Text, View, ViewProps } from "react-native";
import { cn } from "@/lib/utils";
import { UseMutationResult } from "@tanstack/react-query";
import { XIcon } from "lucide-react-native";

export const MutationError = ({
  mutation,
  ...props
}: {
  mutation: UseMutationResult<any, Error, any>;
} & ViewProps) => {
  return (
    <>
      {mutation.error?.message && (
        <View
          {...props}
          className={cn(
            "bg-destructive flex flex-row items-center gap-2 rounded-md p-2",
            props.className,
          )}
        >
          <XIcon />
          <View className="flex flex-col">
            <Text className="text-destructive-foreground text-md">
              Something went wrong:
            </Text>
            <Text className="text-destructive-foreground text-sm">
              {mutation.error?.message}
            </Text>
          </View>
        </View>
      )}
    </>
  );
};
