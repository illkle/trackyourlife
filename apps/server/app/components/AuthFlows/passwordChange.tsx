import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

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
import { FieldInfo, MutationErrorInfo } from ".";
import { PasswordValidator } from "./common";

export const PasswordChangeForm = ({ className }: { className?: string }) => {
  const changeMutation = useMutation({
    mutationFn: async (v: typeof form.state.values) => {
      const { error } = await authClient.changePassword({
        currentPassword: v.password,
        newPassword: v.newPassword,
        revokeOtherSessions: true,
      });
      if (error) {
        throw new Error(error.message ?? error.statusText);
      }
    },
  });

  const form = useForm({
    defaultValues: {
      password: "",
      newPassword: "",
    },
    onSubmit: async ({ value }) => {
      await changeMutation.mutateAsync(value);
    },
    validators: {
      onChange: z.object({
        password: z.string(),
        newPassword: PasswordValidator,
      }),
    },
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>Here you can update your password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <h4 className="mb-2">Current password</h4>
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

          <h4 className="mt-4 mb-2">New password</h4>
          <form.Field
            name="newPassword"
            children={(field) => (
              <>
                <Input
                  autoComplete="new-password"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                  type="password"
                  name="newPassword"
                  id="newPassword"
                />
                <FieldInfo field={field} />
              </>
            )}
          />

          {changeMutation.isSuccess ? (
            <Alert className="mt-4">
              <AlertTitle className="">Password changed</AlertTitle>
              <AlertDescription>
                Your password has been changed. All sessions except this one
                have been revoked.
              </AlertDescription>
            </Alert>
          ) : (
            <Button
              onClick={() => form.handleSubmit()}
              isLoading={form.state.isSubmitting}
              variant={"outline"}
              className="mt-4 w-full"
              type="submit"
            >
              Change password
            </Button>
          )}

          {changeMutation.error && (
            <MutationErrorInfo message={changeMutation.error.message} />
          )}
        </form>
      </CardContent>
    </Card>
  );
};
