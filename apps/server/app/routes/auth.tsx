import { cn } from "@shad/utils";
import {
  createFileRoute,
  Link,
  Navigate,
  Outlet,
} from "@tanstack/react-router";

import Header, { HeaderLogo } from "~/components/Header";
import { useSessionInfo } from "~/utils/useSessionInfo";

export const Route = createFileRoute("/auth")({
  component: AppComponent,
});

function AppComponent() {
  const { data } = useSessionInfo();
  if (data?.sessionInfo) {
    return <Navigate to="/app" />;
  }

  return (
    <div className={cn("h-full max-h-full min-h-screen w-full", "")}>
      <Header>
        <Link to={"/auth/login"}>
          <HeaderLogo />
        </Link>
      </Header>
      <div className="m-auto mt-4 max-w-lg max-sm:px-4">
        <Outlet />
      </div>
    </div>
  );
}
