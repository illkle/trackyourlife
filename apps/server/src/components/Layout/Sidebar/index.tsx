import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import {
  ChevronUp,
  HeartIcon,
  PanelLeftClose,
  PanelLeftOpen,
  User2,
} from "lucide-react";

import { sortTrackableList } from "@tyl/helpers/trackables";

import { Button } from "~/@shad/components/button";
import {
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
import { useZeroTrackablesList } from "~/utils/useZ";

const TrackablesMiniList = () => {
  const [data] = useZeroTrackablesList();

  const loc = useLocation();

  if (data.length === 0) return <div></div>;

  const sorted = sortTrackableList(
    // Temporary fix for bugged query
    data.filter((tr) => !tr.trackableGroup.some((v) => v.group === "archived")),
  );

  return (
    <SidebarMenu>
      {sorted.map((tr) => {
        return (
          <SidebarMenuItem key={tr.id}>
            <SidebarMenuButton asChild isActive={loc.pathname.includes(tr.id)}>
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

                  {tr.trackableGroup.some((v) => v.group === "favorites") && (
                    <div>
                      <HeartIcon fill="currentColor" size={16} />
                    </div>
                  )}
                </div>
              </Link>
            </SidebarMenuButton>
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
              <SidebarMenuButton asChild isActive={loc.pathname === item.to}>
                <Link {...item}>{item.label}</Link>
              </SidebarMenuButton>
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
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> {sessionInfo.user.name}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-(--radix-popper-anchor-width)"
              >
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
