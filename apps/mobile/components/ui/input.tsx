import type { TextInputProps } from "react-native";
import { TextInput } from "react-native";
import { cn } from "@/lib/utils";

function Input({
  className,

  ...props
}: TextInputProps & React.RefAttributes<TextInput>) {
  return (
    <TextInput
      className={cn(
        "dark:bg-input/30 border-input bg-background text-foreground text-md flex h-11 w-full min-w-0 flex-row items-center rounded-md border px-3 py-1 leading-5 shadow-sm shadow-black/5 sm:h-9",
        props.editable === false && "opacity-50",
        "placeholder:text-muted-foreground/50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
