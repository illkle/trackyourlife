import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import {
  ChevronUp,
  HeartIcon,
  PanelLeftClose,
  PanelLeftOpen,
  User2,
} from "lucide-react";

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
import { invalidateSession, useSessionAuthed } from "~/utils/useSessionInfo";
import { useTrackablesList } from "@tyl/helpers/dbHooks";

const TrackablesMiniList = () => {
  const q = useTrackablesList();

  const loc = useLocation();

  if (q.data.length === 0) return <div>{q.error?.message}</div>;

  return (
    <SidebarMenu>
      {q.data.map((tr) => {
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
                    <div className="justify-baseline flex items-center gap-2 truncate">
                      <div className="opacity-70">
                        <RenderTrackableIcon
                          size={16}
                          type={tr.type as "number" | "boolean" | "text"}
                        />
                      </div>
                      <div>{tr.name || "Unnamed"}</div>
                    </div>

                    {tr.groups.some((v) => v.group === "favorites") && (
                      <div>
                        <HeartIcon fill="currentColor" size={16} />
                      </div>
                    )}
                  </div>
                </Link>
              }
              isActive={loc.pathname.includes(tr.id)}
            />
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
};

export const AppSidebar = () => {
  const loc = useLocation();
  const qc = useQueryClient();

  const { sessionInfo } = useSessionAuthed();

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
          <SidebarGroupLabel>Trackables</SidebarGroupLabel>
          <SidebarGroupContent>
            <TrackablesMiniList />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton className="w-full">
                    <User2 /> {sessionInfo.user.name}
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent side="top">
                <ThemeSwitcher className="mb-2 w-full" />
                <DropdownMenuItem
                  onClick={async () => {
                    await authClient.signOut({
                      fetchOptions: {
                        onSuccess: async () => {
                          await invalidateSession(qc);
                        },
                      },
                    });
                  }}
                >
                  <span>Sign out</span>
                </DropdownMenuItem>
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
