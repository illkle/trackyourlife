import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod/v4";

import { EmailValidator } from "@tyl/helpers/validators";

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
import { authClient } from "~/auth/client";
import { auth } from "~/auth/server";
import { FieldInfo, MutationErrorInfo } from ".";

const ForgotPasswordForm = () => {
  const sendMutation = useMutation({
    mutationFn: async (v: typeof form.state.values) => {
      const { error } = await authClient.requestPasswordReset({
        email: v.email,
        redirectTo: "/auth/passwordreset",
      });
      if (error) {
        throw new Error(error.message ?? error.statusText);
      }
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      await sendMutation.mutateAsync(value);
    },
    validators: {
      onChange: z.object({
        email: EmailValidator,
      }),
    },
  });

  return (
    <Card className="m-auto">
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>
          Enter your email address and we will send you a link to reset your
          password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field
            name="email"
            children={(field) => (
              <>
                <Input
                  disabled={
                    field.form.state.isSubmitted || field.form.state.isSubmitted
                  }
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
          {sendMutation.isSuccess ? (
            <Alert className="mt-4">
              <AlertTitle className="">Link sent</AlertTitle>
              <AlertDescription>
                Check your email for a password reset link.
              </AlertDescription>
            </Alert>
          ) : (
            <Button
              onClick={() => form.handleSubmit()}
              isLoading={form.state.isSubmitting}
              variant={"default"}
              className="mt-4 w-full"
              type="submit"
            >
              Send link
            </Button>
          )}

          {sendMutation.error && (
            <MutationErrorInfo message={sendMutation.error.message} />
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export { ForgotPasswordForm };
