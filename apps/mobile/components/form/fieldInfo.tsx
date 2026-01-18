import { Text, View } from "react-native";
import { AnyFieldApi } from "@tanstack/react-form";
import { XIcon } from "lucide-react-native";

export function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length && (
        <View className="box-border flex w-fit items-center gap-2 px-2.5 text-sm font-light text-foreground">
          <XIcon size={16} strokeWidth={1.5} />
          <Text>
            {(field.state.meta.errors as { message: string }[]).map((e) => e.message).join(",")}
          </Text>
        </View>
      )}
    </>
  );
}
