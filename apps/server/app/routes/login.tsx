import { createFileRoute, Navigate, redirect } from "@tanstack/react-router";

import { cn } from "~/@shad/utils/index";
import LoginForm from "~/components/LoginForm";
import { useSessionAuthed, useSessionInfo } from "~/utils/useSessionInfo";

export const Route = createFileRoute("/login")({
  component: LoginComp,
});

function LoginComp() {
  const u = useSessionInfo();

  if (u.data?.sessionInfo?.session) {
    return <Navigate to="/app" />;
  }

  return (
    <div
      className={cn(
        "h-full max-h-full min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50",
      )}
    >
      <div className="mx-auto box-border w-full pt-6 max-xl:col-span-2">
        <LoginForm />
      </div>
    </div>
  );
}
