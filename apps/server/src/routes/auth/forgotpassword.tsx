import { createFileRoute } from "@tanstack/react-router";

import { ForgotPasswordForm } from "~/components/AuthFlows/forgotPassword";

export const Route = createFileRoute("/auth/forgotpassword")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ForgotPasswordForm />;
}
