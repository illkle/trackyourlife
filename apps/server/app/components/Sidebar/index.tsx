import type { ReactNode } from "react";
import React, { useMemo } from "react";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { useZero } from "@rocicorp/zero/react";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import {
  ChartColumnIncreasing,
  ChevronUp,
  HeartIcon,
  SmileIcon,
  ToggleRight,
  User2,
} from "lucide-react";

import { DbTrackableSelect } from "@tyl/db/schema";
import { sortTrackableList } from "@tyl/helpers/trackables";

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
} from "~/@shad/components/sidebar";
import { logoutFn } from "~/auth/authOperations";
import { CoreLinks } from "~/components/Header";
import { useUserSafe } from "~/components/Providers/UserContext";
import { ThemeSwitcher } from "~/components/Settings/themeSwitcher";
import { useZeroTrackablesList, useZeroUser } from "~/utils/useZ";

const iconsMap: Record<DbTrackableSelect["type"], ReactNode> = {
  boolean: <ToggleRight size={16} />,
  range: <SmileIcon size={16} />,
  number: <ChartColumnIncreasing size={16} />,
};

const TrackablesMiniList = () => {
  const [data, info] = useZeroTrackablesList();

  const user = useUserSafe();

  const loc = useLocation();

  const favsSet = useMemo(() => {
    return new Set(user?.settings?.favorites || []);
  }, [user]);

  if (!data || data.length === 0) return <div></div>;

  const sorted = sortTrackableList([...data], user?.settings?.favorites || []);

  return (
    <SidebarMenu>
      {sorted.map((tr) => {
        return (
          <SidebarMenuItem key={tr.id}>
            <SidebarMenuButton asChild isActive={loc.pathname.includes(tr.id)}>
              <Link
                key={tr.id}
                to={`/app/trackables/${tr.id}/`}
                search={(prev) =>
                  user?.settings.preserveLocationOnSidebarNav
                    ? {
                        ...prev,
                      }
                    : {}
                }
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="justify-baseline flex items-center gap-2 truncate">
                    <div className="opacity-70">{iconsMap[tr.type]}</div>
                    <div>{tr.name || "Unnamed"}</div>
                  </div>

                  {favsSet.has(tr.id) && (
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
  const router = useRouter();

  const user = useUserSafe();

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
                  <User2 /> {user.username}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <ThemeSwitcher className="mb-2 w-full" />
                <DropdownMenuItem
                  onClick={() => {
                    void logoutFn();
                    void router.navigate({ to: "/login" });
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
