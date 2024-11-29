import type { ButtonProps } from "@shad/button";
import { useState } from "react";
import {
  ActivityLogIcon,
  CalendarIcon,
  ChevronDownIcon,
  GearIcon,
  PlusCircledIcon,
} from "@radix-ui/react-icons";
import { Button } from "@shad/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@shad/drawer";
import { RadioTabItem, RadioTabs } from "@shad/radio-tabs";
import {
  Link,
  linkOptions,
  useLocation,
  useRouter,
} from "@tanstack/react-router";
import { useTheme } from "next-themes";

import { logoutFn } from "~/auth/authOperations";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "~/components/Dropdown";
import { useUserQuery } from "~/query/user";
import { useIsDesktop } from "~/utils/useIsDesktop";

const SigOutButton = () => {
  const router = useRouter();

  const [isLoading, setLoading] = useState(false);

  const signOut = async () => {
    setLoading(true);
    await logoutFn();
    void router.navigate({ to: "/login" });
    setLoading(false);
  };

  return (
    <Button
      variant="outline"
      isLoading={isLoading}
      onClick={() => void signOut()}
      className="w-full text-center"
    >
      Sign Out
    </Button>
  );
};

export const CoreLinks = [
  linkOptions({
    to: "/app",
    label: (
      <>
        <CalendarIcon />
        Today
      </>
    ),
  }),
  linkOptions({
    to: "/app/trackables",
    label: (
      <>
        <ActivityLogIcon />
        Trackables
      </>
    ),
  }),
  linkOptions({
    to: "/app/create",
    label: (
      <>
        <PlusCircledIcon />
        Create
      </>
    ),
    variant: "ghost",
  }),
  linkOptions({
    to: "/app/settings",
    label: (
      <>
        <GearIcon />
        Settings
      </>
    ),
  }),
];

const Links = ({
  variant,
  variantActive,
  onClick,
}: {
  variant: ButtonProps["variant"];
  variantActive: ButtonProps["variant"];
  onClick?: () => void;
}) => {
  const loc = useLocation();
  return (
    <div className="flex w-full flex-col items-center gap-2 font-medium md:w-fit md:flex-row">
      {CoreLinks.map((v) => (
        <Link key={v.to} {...v} className="block w-full" onClick={onClick}>
          <Button
            variant={loc.pathname === v.to ? variantActive : variant}
            className="flex w-full gap-2"
          >
            {v.label}
          </Button>
        </Link>
      ))}
    </div>
  );
};

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <RadioTabs value={theme} onValueChange={setTheme}>
      <RadioTabItem value="light" id="light">
        Light
      </RadioTabItem>
      <RadioTabItem value="system" id="system">
        System
      </RadioTabItem>
      <RadioTabItem value="dark" id="dark">
        Dark
      </RadioTabItem>
    </RadioTabs>
  );
};

const HeaderMenu = ({ username }: { username?: string }) => {
  const isDesktop = useIsDesktop();

  const [opened, setOpened] = useState(false);

  const Trigger = (
    <div className="relative flex cursor-pointer items-center px-4 transition-colors hover:text-neutral-600 dark:hover:text-neutral-50">
      <p className="font-medium">{username ?? ""}</p>
      <ChevronDownIcon className={"w-6 transition-transform"} />
    </div>
  );

  const Content = (
    <div className="flex flex-col gap-2">
      <ThemeSwitcher />
      <SigOutButton key={"so"} />
    </div>
  );

  return (
    <>
      <div className="hidden md:block xl:hidden">
        <Links variant={"ghost"} variantActive={"secondary"} />
      </div>
      {isDesktop ? (
        <>
          <Dropdown
            open={opened}
            onOpenChange={setOpened}
            placement="bottom-end"
          >
            <DropdownTrigger>{Trigger}</DropdownTrigger>
            <DropdownContent>{Content}</DropdownContent>
          </Dropdown>
        </>
      ) : (
        <Drawer open={opened} onOpenChange={setOpened}>
          <DrawerTrigger>{Trigger}</DrawerTrigger>
          <DrawerContent className="flex flex-col items-center gap-2">
            <DrawerHeader>
              <DrawerTitle>{username ?? ""}</DrawerTitle>
            </DrawerHeader>

            <div className="m-auto flex w-full max-w-80 flex-col gap-2 px-4 pb-4">
              <Links
                variant={"outline"}
                variantActive={"outline"}
                onClick={() => setOpened(false)}
              />

              {Content}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};

const Header = () => {
  const { data } = useUserQuery();

  return (
    <div className="flex h-full w-full items-center justify-between px-0">
      <Link
        to={"/app"}
        className="flex h-full items-center justify-center px-4 xl:px-6"
      >
        <h2 className="text-2xl font-bold tracking-wider">TYL</h2>
      </Link>

      {data ? <HeaderMenu username={data.username} /> : <></>}
    </div>
  );
};

export default Header;
