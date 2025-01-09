import { useQueryClient } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/start";
import { KeyRound, MailCheck, MailQuestionIcon, UserIcon } from "lucide-react";
import { getWebRequest } from "vinxi/server";

import { Button } from "~/@shad/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/@shad/components/card";
import { authClient } from "~/auth/client";
import { auth } from "~/auth/server";
import { EmailChangeForm } from "~/components/AuthFlows/emailChange";
import { PasswordChangeForm } from "~/components/AuthFlows/passwordChange";
import { SendVerificationEmailButton } from "~/components/AuthFlows/sendVerificationEmail";
import { UsernameChangeForm } from "~/components/AuthFlows/usernameChange";
import { invalidateSession, useSessionAuthed } from "~/utils/useSessionInfo";

export const UserSettings = () => {
  const { sessionInfo } = useSessionAuthed();

  const qc = useQueryClient();
  const emailVerified = sessionInfo.user.emailVerified;

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex w-fit flex-col gap-2">
              <div className="flex flex-row items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <div>{sessionInfo.user.name}</div>
              </div>

              <div className="flex flex-row items-center gap-2">
                {emailVerified ? (
                  <MailCheck className="h-4 w-4" />
                ) : (
                  <MailQuestionIcon className="h-4 w-4" />
                )}
                <div>{sessionInfo.user.email}</div>
              </div>

              <div className="flex flex-row items-center gap-2">
                <KeyRound className="h-4 w-4" />
                <div className="">****************</div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4">
              <SendVerificationEmailButton />
            </div>

            <Button
              onClick={async () => {
                await authClient.signOut({
                  fetchOptions: {
                    onSuccess: async () => {
                      await invalidateSession(qc);
                    },
                  },
                });
              }}
              className="mt-2 w-full"
              variant={"outline"}
            >
              Sign out
            </Button>
          </CardContent>
        </Card>

        <UsernameChangeForm className="flex-1" />
        <PasswordChangeForm className="flex-1" />
        <EmailChangeForm className="flex-1" />
      </div>
    </div>
  );
};
