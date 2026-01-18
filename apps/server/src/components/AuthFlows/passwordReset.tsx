import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { z } from "zod/v4";

import { PasswordValidator } from "@tyl/helpers/validators";

import { Button } from "~/@shad/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/@shad/components/card";
import { Input } from "~/@shad/components/input";
import { MaybeLoading } from "~/@shad/custom/maybe-loading";
import { authClient } from "~/auth/client";
import { FieldInfo, MutationErrorInfo } from ".";

export const PasswordResetForm = () => {
  const router = useRouter();
  const resetMutation = useMutation({
    mutationFn: async (v: typeof form.state.values) => {
      const { error } = await authClient.resetPassword({
        newPassword: v.password,
      });

      if (error) {
        throw new Error(error.message ?? error.statusText);
      }
    },
    onSuccess: () => {
      void router.navigate({ to: "/auth/login" });
    },
  });

  const form = useForm({
    defaultValues: {
      password: "",
    },
    onSubmit: async ({ value }) => {
      await resetMutation.mutateAsync(value);
    },
    validators: {
      onChange: z.object({
        password: PasswordValidator,
      }),
    },
  });

  return (
    <Card className="m-auto">
      <CardHeader>
        <CardTitle>Enter your new password</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field
            name="password"
            children={(field) => (
              <>
                <Input
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                  autoComplete="new-password"
                  type="password"
                  name="password"
                  id="password"
                />
                <FieldInfo field={field} />
              </>
            )}
          />

          <Button
            onClick={() => form.handleSubmit()}
            className="mt-4 w-full"
            type="submit"
          >
            <MaybeLoading isLoading={form.state.isSubmitting}>
              Update password
            </MaybeLoading>
          </Button>
          {resetMutation.error && (
            <MutationErrorInfo message={resetMutation.error.message} />
          )}
        </form>
      </CardContent>
    </Card>
  );
};
