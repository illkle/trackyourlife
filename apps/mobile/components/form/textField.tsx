import { TextInputProps, View } from "react-native";
import { FieldInfo } from "@/components/form/fieldInfo";
import { FormLabel } from "@/components/form/label";
import { Input } from "@/components/ui/input";
import { AnyFieldApi } from "@tanstack/react-form";

export const FormTextField = ({
  field,
  label,
  inputProps,
}: {
  field: AnyFieldApi;
  label: string;
  inputProps?: TextInputProps;
}) => {
  return (
    <View>
      <FormLabel text={label} />
      <Input
        value={field.state.value}
        onChange={(e) => field.handleChange(e.nativeEvent.text)}
        {...inputProps}
      />
      <FieldInfo field={field} />
    </View>
  );
};
