import { useMutation } from "@tanstack/react-query";

import { Button } from "~/@shad/components/button";
import { MaybeLoading } from "~/@shad/custom/maybe-loading";
import { authClient } from "~/auth/client";
import { useSessionAuthed } from "~/utils/useSessionInfo";
import { MutationErrorInfo } from ".";

export const SendVerificationEmailButton = () => {
  const { sessionInfo } = useSessionAuthed();

  const sendMutation = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.sendVerificationEmail({
        email: sessionInfo.user.email,
        callbackURL: "/app/settings",
      });
      if (error) {
        throw new Error(error.message ?? error.statusText);
      }
    },
  });

  const emailVerified = sessionInfo.user.emailVerified;

  if (emailVerified) {
    return null;
  }

  return (
    <>
      <Button
        variant={"default"}
        className="w-full"
        disabled={sendMutation.isSuccess}
        onClick={() => sendMutation.mutate()}
      >
        <MaybeLoading isLoading={sendMutation.isPending}>
          {sendMutation.isSuccess ? "Email sent" : "Resend verification email"}
        </MaybeLoading>
      </Button>

      {sendMutation.error && (
        <MutationErrorInfo message={sendMutation.error.message} />
      )}
    </>
  );
};
