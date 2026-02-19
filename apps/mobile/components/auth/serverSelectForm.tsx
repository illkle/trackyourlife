import { MutationError } from "@/components/form/mutationError";
import { FormTextField } from "@/components/form/textField";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useServerURL } from "@/lib/ServerURLContext";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { View } from "react-native";

export const ServerSelectForm = () => {
  const { update } = useServerURL();
  const form = useForm({
    defaultValues: {
      useHTTPS: true,
      serverURL: "localhost:3000",
      customPowersyncURL: false,
      powersyncURL: "localhost:8080",
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    },
  });

  const mutation = useMutation({
    mutationFn: async (v: typeof form.state.values) => {
      const url = v.useHTTPS ? `https://${v.serverURL}` : `http://${v.serverURL}`;
      const purl = v.useHTTPS ? `https://${v.powersyncURL}` : `http://${v.powersyncURL}`;
      const powersyncURL = v.customPowersyncURL ? purl : `${url}/powersync`;
      update({ serverURL: url, powersyncURL: powersyncURL });
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
        name="customPowersyncURL"
        children={(field) => (
          <Checkbox
            checked={field.state.value}
            onCheckedChange={field.handleChange}
            label="Use custom Powersync URL"
            className="mt-4"
          />
        )}
      />

      <form.Subscribe
        selector={(state) => state.values.customPowersyncURL}
        children={(v) =>
          v && (
            <form.Field
              name="powersyncURL"
              children={(field) => <FormTextField field={field} label="Powersync URL" />}
            />
          )
        }
      />

      <Button
        variant={"outline"}
        onPress={() => void form.handleSubmit()}
        size="lg"
        text="Connect"
        className="mt-4"
      />
      <form.Field
        name="useHTTPS"
        children={(field) => (
          <Checkbox
            checked={field.state.value}
            onCheckedChange={field.handleChange}
            label="HTTPS (recommended)"
            className="mt-4"
          />
        )}
      />
      <MutationError mutation={mutation} className="mt-4" />
    </View>
  );
};
