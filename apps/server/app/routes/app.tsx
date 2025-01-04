import { Zero } from "@rocicorp/zero";
import { ZeroProvider } from "@rocicorp/zero/react";
import { cn } from "@shad/utils";
import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Outlet,
  redirect,
  useRouteContext,
} from "@tanstack/react-router";

import { SidebarProvider } from "~/@shad/components/sidebar";
import { authClient } from "~/auth/client";
import Header from "~/components/Header";
import { AppSidebar } from "~/components/Sidebar";
import { schema } from "~/schema";
import { useSessionAuthed, useSessionInfo } from "~/utils/useSessionInfo";
import { preloadCore } from "~/utils/useZ";

export const Route = createFileRoute("/app")({
  component: AppComponent,
});

function AppComponent() {
  const { sessionInfo, token } = useSessionAuthed();

  const z = new Zero({
    userID: sessionInfo.user.id,
    server: "http://localhost:4848/",
    schema,
    kvStore: "idb",
    auth: token,
  });

  console.log("bbb");

  return (
    <ZeroProvider zero={z}>
      <MainPreloader>
        <SidebarProvider>
          <AppSidebar />
          <div className={cn("h-full max-h-full min-h-screen w-full", "")}>
            <Header />
            <div className="mx-auto box-border w-full pt-4 max-xl:col-span-2">
              <Outlet />
            </div>
          </div>
        </SidebarProvider>
      </MainPreloader>
    </ZeroProvider>
  );
}

const MainPreloader = ({ children }: { children: React.ReactNode }) => {
  preloadCore();

  return children;
};
