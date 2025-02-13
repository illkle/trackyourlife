import { useEffect, useRef, useState } from "react";
import { Zero } from "@rocicorp/zero";
import { ZeroProvider } from "@rocicorp/zero/react";
import { cn } from "@shad/utils";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

import { SidebarProvider } from "~/@shad/components/sidebar";
import { EditorModalV2 } from "~/components/EditorModalV2";
import Header, { HeaderLogo } from "~/components/Layout/Header";
import { AppSidebar, SidebarToggle } from "~/components/Layout/Sidebar";
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
  usePreloadCore();

  return children;
};

export const Debugger = () => {
  const [dimensions, setDimensions] = useState({
    innerHeight: window.innerHeight,
    viewportHeight: window.visualViewport?.height ?? 0,
    offsetTop: window.visualViewport?.offsetTop ?? 0,
  });
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const updateDimensions = () => {
      const dimensions = {
        innerHeight: window.innerHeight,
        viewportHeight: window.visualViewport?.height ?? 0,
        offsetTop: window.visualViewport?.offsetTop ?? 0,
      };

      setDimensions(dimensions);
      if (target.current) {
        if (!window.visualViewport) return;
        const offset =
          document.documentElement.clientHeight -
          (window.visualViewport.height + window.visualViewport.offsetTop);
        setOffset(offset);
        target.current.style.bottom = offset + "px";
      }
    };

    window.visualViewport?.addEventListener("resize", updateDimensions);
    window.visualViewport?.addEventListener("scroll", updateDimensions);

    return () => {
      window.visualViewport?.removeEventListener("resize", updateDimensions);
      window.visualViewport?.removeEventListener("scroll", updateDimensions);
    };
  }, []);

  const shoudOffsetBy =
    dimensions.innerHeight - dimensions.viewportHeight - dimensions.offsetTop;

  const target = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className="fixed top-4 right-4 z-50 rounded bg-neutral-800 p-4 text-sm text-white opacity-75">
        <div>innerHeight: {Math.round(dimensions.innerHeight)}</div>
        <div>viewport height: {Math.round(dimensions.viewportHeight)}</div>
        <div>viewport offsetTop: {Math.round(dimensions.offsetTop)}</div>
        <div>should offset by: {Math.round(shoudOffsetBy)}</div>
      </div>
      <div
        ref={target}
        className="fixed bottom-0 h-40 w-full translate-z-0 bg-red-500"
      >
        {offset}
        {Math.round(dimensions.innerHeight)}{" "}
        {Math.round(dimensions.viewportHeight)}{" "}
        {Math.round(dimensions.offsetTop)}
      </div>
    </>
  );
};
