import { createFileRoute } from "@tanstack/react-router";

import LoginForm from "~/components/AuthFlows";

export const Route = createFileRoute("/auth/login")({
  component: LoginComp,
});

function LoginComp() {
  return <LoginForm />;
}
