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
import { authClient } from "~/auth/client";
import { CoreLinks } from "~/components/Header";
import { ThemeSwitcher } from "~/components/Settings/themeSwitcher";
import { useZeroGroupSet, useZeroTrackablesList } from "~/utils/useZ";

const iconsMap: Record<DbTrackableSelect["type"], ReactNode> = {
  boolean: <ToggleRight size={16} />,
  range: <SmileIcon size={16} />,
  number: <ChartColumnIncreasing size={16} />,
};

const TrackablesMiniList = () => {
  const [data, info] = useZeroTrackablesList();

  const loc = useLocation();

  const favsSet = useZeroGroupSet("favorites");

  if (!data || data.length === 0) return <div></div>;

  const sorted = sortTrackableList([...data], favsSet);

  return (
    <SidebarMenu>
      {sorted.map((tr) => {
        return (
          <SidebarMenuItem key={tr.id}>
            <SidebarMenuButton asChild isActive={loc.pathname.includes(tr.id)}>
              <Link
                key={tr.id}
                to={`/app/trackables/${tr.id}/`}
                search={(prev) => ({
                  ...prev,
                })}
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
  const { data } = authClient.useSession();

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
                  <User2 /> {data?.user.name}
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
                    authClient.signOut({
                      fetchOptions: {
                        onSuccess: async () => {
                          await router.navigate({ to: "/login" });
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
