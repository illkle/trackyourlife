import { Text, TextProps } from "react-native";
import { cn } from "@/lib/utils";

export const FormLabel = ({ text, ...props }: TextProps & { text: string }) => {
  return (
    <Text {...props} className={cn("text-md mt-3 mb-1 text-muted-foreground", props.className)}>
      {text}
    </Text>
  );
};
