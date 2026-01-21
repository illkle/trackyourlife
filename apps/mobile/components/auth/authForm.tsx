import { useState } from "react";
import { View } from "react-native";
import { MutationError } from "@/components/form/mutationError";
import { FormTextField } from "@/components/form/textField";
import { Button } from "@/components/ui/button";
import { Text } from "react-native";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthClient } from "@/lib/authClient";
import { createFormHookContexts, useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

import { EmailValidator, NameValidator, PasswordValidator } from "@tyl/helpers/validators";
import { useServerURL } from "@/lib/ServerURLContext";

export const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

const Login = () => {
  const { authClient } = useAuthClient();
  const { powersyncURL, serverURL } = useServerURL();
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    },
  });

  const mutation = useMutation({
    mutationFn: async (v: typeof form.state.values) => {
      await authClient.signIn.email(v, {
        onError: (ctx) => {
          throw new Error(ctx.error.message);
        },
      });
    },
    onSuccess: async () => {
      // TODO RESET
    },
  });

  return (
    <View className="flex flex-col">
      <Text className="text-primary">Server URL: {serverURL}</Text>
      <Text className="text-primary">Powersync URL: {powersyncURL}</Text>
      <form.Field
        name="email"
        children={(field) => (
          <FormTextField
            field={field}
            label="Email"
            inputProps={{ keyboardType: "email-address" }}
          />
        )}
      />
      <form.Field
        name="password"
        children={(field) => (
          <FormTextField
            field={field}
            label="Password"
            inputProps={{
              keyboardType: "visible-password",
              secureTextEntry: true,
            }}
          />
        )}
      />
      <Button onPress={() => void form.handleSubmit()} size="lg" text="Login" className="mt-4" />
      <MutationError mutation={mutation} className="mt-4" />
    </View>
  );
};

const Register = () => {
  const { authClient } = useAuthClient();
  const mutation = useMutation({
    mutationFn: async (v: typeof form.state.values) => {
      await authClient.signUp.email(v, {
        onError: (ctx) => {
          throw new Error(ctx.error.message);
        },
      });
    },
    onSuccess: async () => {
      //TODO RESET
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },

    validators: {
      onChange: z.object({
        email: EmailValidator,
        name: NameValidator,
        password: PasswordValidator,
      }),
    },
  });

  return (
    <View className="flex flex-col">
      <form.Field
        name="name"
        children={(field) => (
          <FormTextField field={field} label="Name" inputProps={{ keyboardType: "default" }} />
        )}
      />
      <form.Field
        name="email"
        children={(field) => (
          <FormTextField
            field={field}
            label="Email"
            inputProps={{ keyboardType: "email-address" }}
          />
        )}
      />
      <form.Field
        name="password"
        children={(field) => (
          <FormTextField
            field={field}
            label="Password"
            inputProps={{
              keyboardType: "visible-password",
              secureTextEntry: true,
            }}
          />
        )}
      />
      <Button onPress={() => void form.handleSubmit()} size="lg" text="Register" className="mt-4" />
      <MutationError mutation={mutation} className="mt-4" />
    </View>
  );
};

export const AuthForm = () => {
  const [value, setValue] = useState("login");

  return (
    <View>
      <Tabs value={value} onValueChange={setValue}>
        <TabsList className="mb-2">
          <TabsTrigger text="Login" value="login"></TabsTrigger>
          <TabsTrigger text="Register" value="register"></TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Login />
        </TabsContent>
        <TabsContent value="register">
          <Register />
        </TabsContent>
      </Tabs>
    </View>
  );
};
