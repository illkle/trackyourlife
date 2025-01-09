import { createFileRoute } from "@tanstack/react-router";

import {
  ResetPasswordEmailTemplate,
  VerificationEmailTemplate,
} from "~/auth/email";
import { useZ } from "~/utils/useZ";

export const Route = createFileRoute("/app/testing")({
  component: RouteComponent,
});

function RouteComponent() {
  const z = useZ();

  return (
    <div className="class flex w-fit flex-col">
      user id {z.userID} session
      <div className="w-[600px] bg-white p-4">
        <VerificationEmailTemplate url="https://google.com" />
      </div>
      <div className="w-[600px] bg-white p-4">
        <ResetPasswordEmailTemplate url="https://google.com" />
      </div>
    </div>
  );
}
