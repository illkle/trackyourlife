import { useLayoutEffect, useState } from "react";
import { Zero } from "@rocicorp/zero";
import { ZeroProvider } from "@rocicorp/zero/react";
import { cn } from "@shad/lib/utils";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

import { mutators } from "@tyl/db/mutators";
import { schema } from "@tyl/db/zero-schema";

import { SidebarProvider } from "~/@shad/components/sidebar";
import Header, { HeaderLogo } from "~/components/Layout/Header";
import { AppSidebar, SidebarToggle } from "~/components/Layout/Sidebar";
import { EditorModalV2 } from "~/components/Modal/EditorModalV2";
import { useSessionAuthed } from "~/utils/useSessionInfo";
import { usePreloadCore } from "~/utils/useZ";

export const Route = createFileRoute("/app")({
  component: AppComponent,
});

const makeZero = (userID: string, token: string) => {
  return new Zero({
    userID,
    server: import.meta.env.VITE_ZERO_DOMAIN as string,
    schema: schema,
    auth: token,
    mutators: mutators,
    context: {
      userID: userID,
    },
  });
};

function AppComponent() {
  const { sessionInfo, token } = useSessionAuthed();

  const [zero, setZero] = useState<ReturnType<typeof makeZero> | null>(null);
  useLayoutEffect(() => {
    if (zero) {
      void zero.close();
    }
    setZero(makeZero(sessionInfo.user.id ?? "anon", token));
    // we don't need zero as dep here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, sessionInfo.user.id]);

  if (!zero) {
    return <></>;
  }

  return (
    <ZeroProvider zero={zero}>
      <MainPreloader>
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
      </MainPreloader>
    </ZeroProvider>
  );
}

const MainPreloader = ({ children }: { children: React.ReactNode }) => {
  //usePreloadCore();

  return children;
};
