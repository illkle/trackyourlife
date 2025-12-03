import type { AnyFieldApi } from "@tanstack/react-form";
import { useState } from "react";
import { cn } from "@shad/lib/utils";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { XIcon } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { z } from "zod/v4";

import {
  EmailValidator,
  NameValidator,
  PasswordValidator,
} from "@tyl/helpers/validators";

import { Alert, AlertDescription, AlertTitle } from "~/@shad/components/alert";
import { Button } from "~/@shad/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/@shad/components/card";
import { Input } from "~/@shad/components/input";
import { RadioTabItem, RadioTabs } from "~/@shad/custom/radio-tabs";
import { authClient } from "~/auth/client";
import { invalidateSession } from "~/utils/useSessionInfo";

type ActionState = "login" | "register";

export function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <AnimatePresence>
      {field.state.meta.isTouched && field.state.meta.errors.length && (
        <m.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: 1,
            height: "35px",
          }}
          exit={{ opacity: 0, height: 0 }}
          layout
          className="text-foreground box-border flex w-fit items-center gap-2 px-2.5 text-sm font-light"
        >
          <XIcon size={16} strokeWidth={1.5} />
          {(field.state.meta.errors as { message: string }[])
            .map((e) => e.message)
            .join(",")}
        </m.div>
      )}
    </AnimatePresence>
  );
}

export const MutationErrorInfo = ({ message }: { message: string }) => {
  return (
    <Alert variant="destructive" className="mt-4">
      <AlertTitle className="flex items-center gap-2">
        Something went wrong
      </AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};

const Register = () => {
  const router = useRouter();

  const qc = useQueryClient();

  const registerMutation = useMutation({
    mutationFn: async (v: typeof form.state.values) => {
      await authClient.signUp.email(v, {
        onError: (ctx) => {
          throw new Error(ctx.error.message);
        },
      });
    },
    onSuccess: async () => {
      await invalidateSession(qc);
      await router.navigate({ to: "/" });
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await registerMutation.mutateAsync(value);
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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <h4 className="mb-2">Email</h4>
      <form.Field
        name="email"
        children={(field) => (
          <>
            <Input
              value={field.state.value}
              onChange={(e) => {
                field.handleChange(e.target.value);
              }}
              type="email"
              name="email"
              id="email"
              className="z-2 relative"
              placeholder="person@somemail.com"
            />
            <FieldInfo field={field} />
          </>
        )}
      />

      <h4 className="mb-2 mt-4">Name</h4>
      <form.Field
        name="name"
        children={(field) => (
          <>
            <Input
              value={field.state.value}
              onChange={(e) => {
                field.handleChange(e.target.value);
              }}
              type="text"
              name="name"
              id="name"
              placeholder="John Doe"
            />
            <FieldInfo field={field} />
          </>
        )}
      />
      <h4 className="mb-2 mt-4">Password</h4>
      <form.Field
        name="password"
        children={(field) => (
          <>
            <Input
              autoComplete="new-password"
              value={field.state.value}
              onChange={(e) => {
                field.handleChange(e.target.value);
              }}
              type="password"
              name="password"
              id="password"
            />
            <FieldInfo field={field} />
          </>
        )}
      />

      <Button
        isLoading={form.state.isSubmitting}
        size={"lg"}
        type="submit"
        variant="outline"
        className={cn("mt-6 w-full")}
      >
        Create Account
      </Button>
      {registerMutation.error && (
        <MutationErrorInfo message={registerMutation.error.message} />
      )}
    </form>
  );
};

const Login = () => {
  const router = useRouter();
  const qc = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (v: typeof form.state.values) => {
      await authClient.signIn.email(v, {
        onError: (ctx) => {
          throw new Error(ctx.error.message);
        },
      });
    },
    onSuccess: async () => {
      await invalidateSession(qc);
      await router.navigate({ to: "/" });
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await loginMutation.mutateAsync(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <h4 className="mb-2">Email</h4>
      <form.Field
        name="email"
        children={(field) => (
          <>
            <Input
              autoComplete="email"
              value={field.state.value}
              onChange={(e) => {
                field.handleChange(e.target.value);
              }}
              type="email"
              name="email"
              id="email"
              className="z-2 relative"
              placeholder="person@somemail.com"
            />
            <FieldInfo field={field} />
          </>
        )}
      />
      <div className="flex items-baseline justify-between">
        <h4 className="mb-2 mt-4">Password</h4>
        <Link
          className="text-muted-foreground text-sm"
          to="/auth/forgotpassword"
        >
          Forgot?
        </Link>
      </div>
      <form.Field
        name="password"
        children={(field) => (
          <>
            <Input
              autoComplete="current-password"
              value={field.state.value}
              onChange={(e) => {
                field.handleChange(e.target.value);
              }}
              type="password"
              name="password"
              id="password"
            />
            <FieldInfo field={field} />
          </>
        )}
      />

      <Button
        isLoading={form.state.isSubmitting}
        type="submit"
        size={"lg"}
        variant="outline"
        className={cn("mt-6 w-full")}
      >
        Login
      </Button>
      {loginMutation.error && (
        <MutationErrorInfo message={loginMutation.error.message} />
      )}
    </form>
  );
};

const LoginForm = () => {
  const [action, setRegister] = useState<ActionState>("login");

  return (
    <>
      <RadioTabs
        value={action}
        onValueChange={(v) => setRegister(v as ActionState)}
        className="m-auto"
      >
        <RadioTabItem value="login" id="login" className="w-full">
          Existing user
        </RadioTabItem>
        <RadioTabItem value="register" id="register" className="w-full">
          New user
        </RadioTabItem>
      </RadioTabs>
      <Card className="m-auto mt-4">
        <CardHeader>
          <CardTitle>
            {action === "register" ? "Hello" : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {action === "register"
              ? "Let's get to know each other!"
              : "Glad to see you again!"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {action === "login" && <Login />}
          {action === "register" && <Register />}
        </CardContent>
      </Card>
    </>
  );
};

export default LoginForm;
