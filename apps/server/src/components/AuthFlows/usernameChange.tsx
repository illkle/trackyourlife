import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod/v4";

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
import { invalidateSession } from "~/utils/useSessionInfo";
import { FieldInfo, MutationErrorInfo } from ".";

export const UsernameChangeForm = ({ className }: { className?: string }) => {
  const qc = useQueryClient();
  const changeMutation = useMutation({
    mutationFn: async (v: typeof form.state.values) => {
      const { error } = await authClient.updateUser({
        name: v.newUsername,
      });
      if (error) {
        throw new Error(error.message ?? error.statusText);
      }
    },
    onSuccess: async () => {
      await invalidateSession(qc);
    },
  });

  const form = useForm({
    defaultValues: {
      newUsername: "",
    },
    onSubmit: async ({ value }) => {
      await changeMutation.mutateAsync(value);
    },
    validators: {
      onChange: z.object({
        newUsername: z
          .string()
          .min(3, "Username must be at least 3 characters"),
      }),
    },
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Change username</CardTitle>
        <CardDescription>Here you can update your username.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <h4 className="mb-2">New username</h4>
          <form.Field
            name="newUsername"
            children={(field) => (
              <>
                <Input
                  autoComplete="username"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                  type="text"
                  name="newUsername"
                  id="newUsername"
                  className="relative z-2"
                  placeholder="johndoe"
                />
                <FieldInfo field={field} />
              </>
            )}
          />

          {changeMutation.isSuccess ? (
            <Alert className="mt-4">
              <AlertTitle className="">Username updated</AlertTitle>
              <AlertDescription>
                Your username has been changed successfully.
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
              Change username
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
