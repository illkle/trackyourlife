import { Zero } from "@rocicorp/zero";
import { ZeroProvider } from "@rocicorp/zero/react";
import { cn } from "@shad/utils";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

import { SidebarProvider } from "~/@shad/components/sidebar";
import { EditorModalProvider } from "~/components/EditorModal";
import Header, { HeaderLogo } from "~/components/Header";
import { AppSidebar, SidebarToggle } from "~/components/Sidebar";
import { schema } from "~/schema";
import { useSessionAuthed } from "~/utils/useSessionInfo";
import { usePreloadCore } from "~/utils/useZ";

export const Route = createFileRoute("/app")({
  component: AppComponent,
});

function AppComponent() {
  const { sessionInfo, token } = useSessionAuthed();

  const z = new Zero({
    userID: sessionInfo.user.id,
    // Todo proper env
    server: import.meta.env.VITE_ZERO_DOMAIN as string,
    schema,
    kvStore: "idb",
    auth: token,
  });

  return (
    <ZeroProvider zero={z}>
      <MainPreloader>
        <SidebarProvider>
          <AppSidebar />
          <div className={cn("rel h-full max-h-full min-h-screen w-full")}>
            <EditorModalProvider>
              <Header>
                <SidebarToggle />
                <Link to={"/app"}>
                  <HeaderLogo />
                </Link>
              </Header>
              <div className="mx-auto box-border w-full pt-4 max-xl:col-span-2">
                <Outlet />
              </div>
            </EditorModalProvider>
          </div>
        </SidebarProvider>
      </MainPreloader>
    </ZeroProvider>
  );
}

const MainPreloader = ({ children }: { children: React.ReactNode }) => {
  usePreloadCore();

  return children;
};
