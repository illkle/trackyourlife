import { cn } from "@shad/lib/utils";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

import Header, { HeaderLogo } from "~/components/Layout/Header";
import { UserPreloader } from "~/utils/useSessionInfo";

export const Route = createFileRoute("/auth")({
  component: AppComponent,
});

function AppComponent() {
  return (
    <UserPreloader redirectOnAuth={true}>
      <div className={cn("h-full max-h-full min-h-screen w-full", "")}>
        <Header>
          <div></div>
          <Link to={"/auth/login"}>
            <HeaderLogo />
          </Link>
        </Header>
        <div className="m-auto mt-4 max-w-lg max-sm:px-4">
          <Outlet />
        </div>
      </div>
    </UserPreloader>
  );
}
