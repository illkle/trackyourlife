import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { invalidateSession, useSessionAuthed } from "~/utils/useSessionInfo";
import { FieldInfo, MutationErrorInfo } from ".";
import { EmailValidator } from "./common";

export const EmailChangeForm = ({ className }: { className?: string }) => {
  const { sessionInfo } = useSessionAuthed();

  const isVerified = sessionInfo.user.emailVerified;

  const changeMutation = useMutation({
    mutationFn: async (v: typeof form.state.values) => {
      const { error } = await authClient.changeEmail(v);
      if (error) {
        throw new Error(error.message ?? error.statusText);
      }
    },
    onSuccess: async () => {
      if (!isVerified) {
        await invalidateSession(qc);
      }
    },
  });

  const qc = useQueryClient();

  const form = useForm({
    defaultValues: {
      newEmail: "",
    },
    onSubmit: async ({ value }) => {
      await changeMutation.mutateAsync(value);
    },

    validators: {
      onChange: z.object({
        newEmail: EmailValidator,
      }),
    },
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Change email</CardTitle>
        <CardDescription>
          Here you can update your email address.
          {isVerified ? " This will require verification." : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <h4 className="mb-2">New email</h4>
          <form.Field
            name="newEmail"
            children={(field) => (
              <>
                <Input
                  autoComplete="new-email"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                  }}
                  type="email"
                  name="newEmail"
                  id="newEmail"
                  className="relative z-2"
                  placeholder="person@somemail.com"
                />
                <FieldInfo field={field} />
              </>
            )}
          />

          {changeMutation.isSuccess ? (
            <Alert className="mt-4">
              {isVerified ? (
                <>
                  <AlertTitle className="">Verification email sent</AlertTitle>
                  <AlertDescription>
                    After clicking link in sent to your new email, your email
                    will be changed.
                  </AlertDescription>
                </>
              ) : (
                <>
                  <AlertTitle className="">Email changed</AlertTitle>
                  <AlertDescription>
                    Please verify your new email.
                  </AlertDescription>
                </>
              )}
            </Alert>
          ) : (
            <Button
              onClick={() => form.handleSubmit()}
              isLoading={form.state.isSubmitting}
              variant={"outline"}
              className="mt-4 w-full"
              type="submit"
            >
              Change email
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
