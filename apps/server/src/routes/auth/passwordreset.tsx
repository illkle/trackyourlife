import { createFileRoute } from "@tanstack/react-router";

import { PasswordResetForm } from "~/components/AuthFlows/passwordReset";

export const Route = createFileRoute("/auth/passwordreset")({
  component: RouteComponent,
});

function RouteComponent() {
  return <PasswordResetForm />;
}
