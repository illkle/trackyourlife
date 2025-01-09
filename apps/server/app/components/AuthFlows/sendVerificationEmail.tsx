import { useMutation } from "@tanstack/react-query";

import { Button } from "~/@shad/components/button";
import { sendVerificationLetterProtected } from "~/components/Settings";
import { useSessionAuthed } from "~/utils/useSessionInfo";
import { MutationErrorInfo } from ".";

export const SendVerificationEmailButton = () => {
  const { sessionInfo } = useSessionAuthed();

  const sendMutation = useMutation({
    mutationFn: async () => {
      await sendVerificationLetterProtected();
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
        isLoading={sendMutation.isPending}
        onClick={() => sendMutation.mutate()}
      >
        {sendMutation.isSuccess ? "Email sent" : "Resend verification email"}
      </Button>

      {sendMutation.error && (
        <MutationErrorInfo message={sendMutation.error.message} />
      )}
    </>
  );
};
