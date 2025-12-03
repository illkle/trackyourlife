import { Text, TextProps } from "react-native";
import { cn } from "@/lib/utils";

export const FormLabel = ({ text, ...props }: TextProps & { text: string }) => {
  return (
    <Text
      {...props}
      className={cn("text-muted-foreground text-md mb-1 mt-3", props.className)}
    >
      {text}
    </Text>
  );
};
