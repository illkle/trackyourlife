import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";
import { cn } from "@shad/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTrigger,
} from "~/@shad/components/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "~/@shad/components/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/@shad/components/popover";
import { useIsDesktop } from "~/utils/useIsDesktop";

interface DynamicModalContext {
  isDesktop: boolean;
  desktopMode: "dialog" | "popover";
  mobileMode: "drawer";

  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DynamicModalContext = createContext<DynamicModalContext>({
  isDesktop: false,
  desktopMode: "dialog",
  mobileMode: "drawer",
  open: false,
  onOpenChange: () => {
    return;
  },
});

/*
 *  Abstraction to show different types of modals on desktop and mobile with unified API
 *  This is slighly less optimal becuase we are loading more js that we need, but I don't think it matters really for a webapp
 */
export const DynamicModal = ({
  children,
  desktopMode = "dialog",
  mobileMode = "drawer",
  open,
  onOpenChange,
}: {
  children: React.ReactNode;
  desktopMode?: DynamicModalContext["desktopMode"];
  mobileMode?: DynamicModalContext["mobileMode"];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const isDesktop = useIsDesktop();

  const ctx = useMemo(() => {
    return { isDesktop, desktopMode, mobileMode, open, onOpenChange };
  }, [isDesktop, desktopMode, mobileMode, open, onOpenChange]);

  if (isDesktop) {
    if (desktopMode === "popover") {
      return (
        <DynamicModalContext.Provider value={ctx}>
          <Popover open={open} onOpenChange={onOpenChange}>
            {children}
          </Popover>
        </DynamicModalContext.Provider>
      );
    }

    return (
      <DynamicModalContext.Provider value={ctx}>
        <Dialog open={open} onOpenChange={onOpenChange}>
          {children}
        </Dialog>
      </DynamicModalContext.Provider>
    );
  }

  return (
    <DynamicModalContext.Provider value={ctx}>
      <Drawer open={open} onOpenChange={onOpenChange}>
        {children}
      </Drawer>
    </DynamicModalContext.Provider>
  );
};

type PopoverTriggerProps = React.ComponentProps<typeof PopoverTrigger>;
type DialogTriggerProps = React.ComponentProps<typeof DialogTrigger>;
type DrawerTriggerProps = React.ComponentProps<typeof DrawerTrigger>;
type ButtonProps = Omit<React.HTMLAttributes<HTMLButtonElement>, "onClick">;

/*
 *  Trigger to show the modal.
 *  Note that className on component root is applied to all, merged with one from somethingProps
 */
export const DynamicModalTrigger = ({
  children,
  popoverProps,
  dialogProps,
  drawerProps,
  className,
}: {
  children: ReactNode;
  popoverProps?: PopoverTriggerProps;
  dialogProps?: DialogTriggerProps;
  drawerProps?: DrawerTriggerProps;
  editorProps?: ButtonProps;
  className?: string;
}) => {
  const { desktopMode, isDesktop } = useContext(DynamicModalContext);

  if (isDesktop) {
    if (desktopMode === "popover") {
      return (
        <PopoverTrigger
          {...popoverProps}
          className={cn(className, popoverProps?.className)}
        >
          {children}
        </PopoverTrigger>
      );
    }

    return (
      <DialogTrigger
        {...dialogProps}
        className={cn(className, dialogProps?.className)}
      >
        {children}
      </DialogTrigger>
    );
  }

  return (
    <DrawerTrigger
      {...drawerProps}
      className={cn(className, drawerProps?.className)}
    >
      {children}
    </DrawerTrigger>
  );
};

type PopoverContentProps = React.ComponentProps<typeof PopoverContent>;
type DialogContentProps = React.ComponentProps<typeof DialogContent>;
type DrawerContentProps = React.ComponentProps<typeof DrawerContent>;

export const DynamicModalContent = ({
  children,
  popoverProps,
  dialogProps,
  drawerProps,
  className,
}: {
  children: ReactNode;
  popoverProps?: PopoverContentProps;
  dialogProps?: DialogContentProps;
  drawerProps?: DrawerContentProps;
  className?: string;
}) => {
  const { desktopMode, isDesktop } = useContext(DynamicModalContext);

  if (isDesktop) {
    if (desktopMode === "popover") {
      return (
        <PopoverContent
          {...popoverProps}
          className={cn(className, popoverProps?.className)}
        >
          {children}
        </PopoverContent>
      );
    }

    return (
      <DialogContent
        {...dialogProps}
        className={cn(className, dialogProps?.className)}
      >
        {children}
      </DialogContent>
    );
  }

  return (
    <DrawerContent
      {...drawerProps}
      className={cn(className, drawerProps?.className)}
    >
      {children}
    </DrawerContent>
  );
};

export const DynamicModalDescription = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { desktopMode, isDesktop } = useContext(DynamicModalContext);

  if (isDesktop) {
    if (desktopMode === "dialog") {
      return <DialogDescription>{children}</DialogDescription>;
    }
    return <></>;
  }

  return (
    <DrawerDescription className="text-center">{children}</DrawerDescription>
  );
};

export const DynamicModalDrawerTitle = ({
  children,
  ...args
}: React.ComponentProps<typeof DrawerTitle> & {
  children: ReactNode;
}) => {
  const { isDesktop, mobileMode } = useContext(DynamicModalContext);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!isDesktop && mobileMode === "drawer") {
    return <DrawerTitle {...args}>{children}</DrawerTitle>;
  }
};
