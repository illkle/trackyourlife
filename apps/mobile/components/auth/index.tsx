import { useState } from "react";
import { TextInputProps, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/authClient";
import {
  AnyFieldApi,
  createFormHookContexts,
  useForm,
} from "@tanstack/react-form";
import { XIcon } from "lucide-react-native";

export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts();

export function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length && (
        <View className="text-foreground box-border flex w-fit items-center gap-2 px-2.5 text-sm font-light">
          <XIcon size={16} strokeWidth={1.5} />
          <Text>
            {(field.state.meta.errors as { message: string }[])
              .map((e) => e.message)
              .join(",")}
          </Text>
        </View>
      )}
    </>
  );
}

const FormTextField = ({
  field,
  label,
  inputProps,
}: {
  field: AnyFieldApi;
  label: string;
  inputProps?: TextInputProps;
}) => {
  return (
    <View className="">
      <Text>{label}</Text>
      <Input
        value={field.state.value}
        onChange={(e) => field.handleChange(e.nativeEvent.text)}
        {...inputProps}
      />
      <FieldInfo field={field} />
    </View>
  );
};

const Login = () => {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onError: (ctx) => {
            throw new Error(ctx.error.message);
          },
        },
      );
    },
  });

  return (
    <View className="flex flex-col gap-4">
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
      <Button onPress={() => void form.handleSubmit()} text="Login" />
    </View>
  );
};

export const LoginForm = () => {
  const [value, setValue] = useState("login");

  return (
    <View>
      <Tabs value={value} onValueChange={setValue}>
        <TabsList>
          <TabsTrigger text="Login" value="login"></TabsTrigger>
          <TabsTrigger text="Register" value="register"></TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Login />
        </TabsContent>
        <TabsContent value="register">
          <Text>TODO</Text>
        </TabsContent>
      </Tabs>
    </View>
  );
};
