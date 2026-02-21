import { Spinner } from "@shad/components/spinner";
import { Link, MatchRoute, redirect, useLocation } from "@tanstack/react-router";
import { ChevronUp, HeartIcon, PanelLeftClose, PanelLeftOpen, User2 } from "lucide-react";

import { Button } from "~/@shad/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/@shad/components/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/@shad/components/sidebar";
import { authClient } from "~/auth/client";
import { CoreLinks } from "~/components/Layout/Header";
import { ThemeSwitcher } from "~/components/UserAppSettings/themeSwitcher";
import { RenderTrackableIcon } from "~/utils/trackableIcons";
import { useAuthAuthed } from "~/utils/useSessionInfo";
import { usePowerSync } from "@powersync/react";
import { useEffect, useState } from "react";
import { cn } from "~/@shad/lib/utils";
import { useTrackablesList } from "@tyl/helpers/data/dbHooksTanstack";

const TrackablesMiniList = () => {
  const q = useTrackablesList();

  if (q.isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner />
      </div>
    );
  }

  if (q.data.length === 0) {
    return <div className="py-16 text-center text-xs text-muted-foreground"></div>;
  }

  return (
    <>
      <SidebarGroupLabel>Trackables</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <MatchRoute to={"/app/trackables/$id"}>
            {(v) =>
              q.data.map(({ trackable: tr, favoriteGroup }) => {
                return (
                  <SidebarMenuItem key={tr.id}>
                    <SidebarMenuButton
                      render={
                        <Link
                          key={tr.id}
                          to={"/app/trackables/$id/view"}
                          params={{ id: tr.id }}
                          search={(prev) => ({
                            ...prev,
                          })}
                        >
                          <div className="flex w-full items-center justify-between gap-2">
                            <div className="flex items-center justify-baseline gap-2 truncate">
                              <div className="opacity-70">
                                <RenderTrackableIcon
                                  size={16}
                                  type={tr.type as "number" | "boolean" | "text"}
                                />
                              </div>
                              <div>{tr.name || "Unnamed"}</div>
                            </div>

                            {favoriteGroup?.group && (
                              <div>
                                <HeartIcon fill="currentColor" size={16} />
                              </div>
                            )}
                          </div>
                        </Link>
                      }
                      isActive={tr.id === v?.id}
                    />
                  </SidebarMenuItem>
                );
              })
            }
          </MatchRoute>
        </SidebarMenu>
      </SidebarGroupContent>
    </>
  );
};

const PowersyncStatus = () => {
  const powersync = usePowerSync();
  const [connected, setConnected] = useState(powersync.connected);

  useEffect(() => {
    return powersync.registerListener({
      statusChanged: (status) => {
        setConnected(status.connected);
      },
    });
  }, [powersync]);

  return (
    <div className="flex items-center gap-2 px-1 py-1 text-xs text-muted-foreground">
      <div
        className={cn(
          "h-2 w-2 rounded-full",
          connected ? "border border-green-400 bg-green-600" : "border border-red-400 bg-red-600",
        )}
      ></div>
      {connected ? "Connected to Sync service" : "No connection to Sync service"}
    </div>
  );
};

export const AppSidebar = () => {
  const loc = useLocation();

  const { user } = useAuthAuthed();

  return (
    <Sidebar variant="floating">
      <SidebarHeader>
        <SidebarMenu>
          {CoreLinks.map((item) => (
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton
                render={<Link {...item}>{item.label}</Link>}
                isActive={loc.pathname === item.to}
              ></SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <TrackablesMiniList />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                nativeButton={false}
                render={
                  <SidebarMenuButton className="w-full">
                    <User2 /> {user.name}
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent side="top" className="px-1">
                <SidebarMenuItem>
                  <PowersyncStatus />
                </SidebarMenuItem>

                <ThemeSwitcher className="my-1 w-full" />

                <DropdownMenuItem
                  render={
                    <Button className="w-full" variant="ghost">
                      Sign out
                    </Button>
                  }
                  onClick={async () => {
                    await authClient.signOut({
                      fetchOptions: {
                        onSuccess: async () => {
                          redirect({ to: "/auth/login" });
                        },
                      },
                    });
                  }}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export const SidebarToggle = ({ className }: { className?: string }) => {
  const { toggleSidebar, state, isMobile, openMobile } = useSidebar();
  return (
    <Button variant="outline" onClick={toggleSidebar} className={className}>
      {(isMobile && !openMobile) || state === "collapsed" ? (
        <>
          <PanelLeftOpen size={16} />
        </>
      ) : (
        <PanelLeftClose size={16} />
      )}
    </Button>
  );
};
