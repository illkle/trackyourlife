import { MutationError } from "@/components/form/mutationError";
import { FormTextField } from "@/components/form/textField";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useServerURL } from "@/lib/ServerURLContext";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { View } from "react-native";

const isDevelopment = process.env.NODE_ENV === "development";

const parseDevBoolean = (value: string | undefined, fallback: boolean) => {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
};

const SERVER_DEFAULTS = {
  useHTTPS: isDevelopment
    ? parseDevBoolean(process.env.EXPO_PUBLIC_DEV_SERVER_USE_HTTPS, true)
    : true,
  serverURL: isDevelopment ? (process.env.EXPO_PUBLIC_DEV_SERVER_URL ?? "") : "",
  customPowersyncURL: isDevelopment
    ? parseDevBoolean(process.env.EXPO_PUBLIC_DEV_SERVER_CUSTOM_POWERSYNC_URL, false)
    : false,
  powersyncURL: isDevelopment ? (process.env.EXPO_PUBLIC_DEV_POWERSYNC_URL ?? "") : "",
};

export const ServerSelectForm = () => {
  const { update } = useServerURL();
  const form = useForm({
    defaultValues: {
      useHTTPS: SERVER_DEFAULTS.useHTTPS,
      serverURL: SERVER_DEFAULTS.serverURL,
      customPowersyncURL: SERVER_DEFAULTS.customPowersyncURL,
      powersyncURL: SERVER_DEFAULTS.powersyncURL,
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
        variant={"default"}
        onPress={() => void form.handleSubmit()}
        size="lg"
        text="Connect"
        className="mt-4"
        loading={mutation.isPending}
      />

      <MutationError mutation={mutation} className="mt-4" />
    </View>
  );
};
