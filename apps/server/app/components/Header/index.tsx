import { linkOptions } from "@tanstack/react-router";
import {
  Calendar1Icon,
  CirclePlusIcon,
  LogsIcon,
  SettingsIcon,
} from "lucide-react";

import { cn } from "~/@shad/utils";

export const CoreLinks = [
  linkOptions({
    to: "/app",
    label: (
      <>
        <Calendar1Icon />
        Today
      </>
    ),
  }),
  linkOptions({
    to: "/app/trackables",
    label: (
      <>
        <LogsIcon />
        Trackables
      </>
    ),
  }),
  linkOptions({
    to: "/app/create",
    label: (
      <>
        <CirclePlusIcon />
        Create
      </>
    ),
    variant: "ghost",
  }),
  linkOptions({
    to: "/app/settings",
    label: (
      <>
        <SettingsIcon />
        Settings
      </>
    ),
  }),
];

export const HeaderLogo = () => {
  return <h2 className="text-2xl font-bold tracking-wider">TYL</h2>;
};

const Header = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className={cn(
        "sticky top-3 z-[50] mx-auto flex max-w-[900px] justify-center font-bold",
        "mt-3 px-3",
      )}
    >
      <div className="absolute h-full w-full -translate-y-1/2 bg-neutral-50 opacity-90 dark:bg-neutral-950"></div>
      <div className="bg-sidebar border-sidebar-border relative flex h-full w-full items-center justify-between rounded-md border px-4 py-2">
        <div className="row-reverse flex w-full items-center justify-between gap-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Header;
