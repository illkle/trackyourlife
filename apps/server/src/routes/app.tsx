import { cn } from "@shad/lib/utils";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

import { SidebarProvider } from "~/@shad/components/sidebar";
import Header, { HeaderLogo } from "~/components/Layout/Header";
import { AppSidebar, SidebarToggle } from "~/components/Layout/Sidebar";
import { EditorModalV2 } from "~/components/Modal/EditorModalV2";
import { PowerSyncProvider } from "~/db/powersync-provider";
import { UserPreloader } from "~/utils/useSessionInfo";

export const Route = createFileRoute("/app")({
  component: AppComponent,
  ssr: false,
});

function AppComponent() {
  return (
    <UserPreloader redirectOnNoAuth={true}>
      <PowerSyncProvider>
        <SidebarProvider>
          <AppSidebar />
          <div className={cn("relative h-full max-h-full min-h-screen w-full")}>
            <Header>
              <SidebarToggle />
              <Link to={"/app"}>
                <HeaderLogo />
              </Link>
            </Header>
            <div className="mx-auto box-border w-full pt-4 max-xl:col-span-2">
              <Outlet />
            </div>
            <EditorModalV2 />
          </div>
        </SidebarProvider>
      </PowerSyncProvider>
    </UserPreloader>
  );
}
