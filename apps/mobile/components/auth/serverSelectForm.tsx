import { MutationError } from "@/components/form/mutationError";
import { FormTextField } from "@/components/form/textField";
import { Button } from "@/components/ui/button";
import { useServerURL } from "@/lib/ServerURLContext";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { View } from "react-native";

export const ServerSelectForm = () => {
  const { update } = useServerURL();
  const form = useForm({
    defaultValues: {
      serverURL: "http://localhost:3000",
      powersyncURL: "http://localhost:8080",
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    },
  });

  const mutation = useMutation({
    mutationFn: async (v: typeof form.state.values) => {
      update({ serverURL: v.serverURL, powersyncURL: v.powersyncURL });
    },
    onSuccess: async () => {
      router.push("/(sign-in)/user");
    },
  });

  return (
    <View className="flex flex-col">
      <form.Field
        name="serverURL"
        children={(field) => <FormTextField field={field} label="Server URL" />}
      />
      <form.Field
        name="powersyncURL"
        children={(field) => <FormTextField field={field} label="Powersync URL" />}
      />
      <Button onPress={() => void form.handleSubmit()} size="lg" text="Next" className="mt-4" />
      <MutationError mutation={mutation} className="mt-4" />
    </View>
  );
};
