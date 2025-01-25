import type {
  FloatingContext,
  Placement,
  ReferenceType,
} from "@floating-ui/react";
import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import {
  autoUpdate,
  flip,
  offset as offsetMiddleware,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
import { cn } from "@shad/utils";
import { AnimatePresence, m } from "motion/react";

export interface IDropdown {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  background?: boolean;
  placement?: Placement;
  placeCenter?: boolean;
  offset?: number;
  children: ReactNode;
}

const DropdownContext = createContext<{
  background?: boolean;
  context?: FloatingContext<ReferenceType>;
}>({
  background: false,
});

const DropdownTrigger = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  const { context } = useContext(DropdownContext);

  if (!context) throw new Error("DropdownTrigger no context");

  const { getReferenceProps } = useInteractions([
    useClick(context),
    useDismiss(context),
  ]);

  return (
    <div
      ref={(...args) => context.refs.setReference(...args)}
      className={className}
      {...getReferenceProps()}
    >
      {children}
    </div>
  );
};

const defaultBackgroundClasses =
  "overflow-hidden box-border rounded-md border border-neutral-200 bg-white p-2 text-neutral-950 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50";

const DropdownContent = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  const { background, context } = useContext(DropdownContext);

  if (!context) throw new Error("");

  const { getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
  ]);

  return (
    <AnimatePresence>
      {context.open && (
        <m.div
          ref={(...args) => context.refs.setFloating(...args)}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          style={{
            position: context.strategy,
            top: context.y || 0,
            left: context.x || 0,
          }}
          className={cn(
            "relative z-50 w-[max-content]",
            background && defaultBackgroundClasses,
            className,
          )}
          {...getFloatingProps()}
        >
          {children}
        </m.div>
      )}
    </AnimatePresence>
  );
};

const Dropdown = ({
  open,
  onOpenChange,
  background = true,
  placement,
  placeCenter,
  offset = 5,
  children,
}: IDropdown) => {
  const [internalOpen, internalSetOpen] = useState(false);

  const { context } = useFloating({
    open: typeof onOpenChange === "function" ? open : internalOpen,
    onOpenChange:
      typeof onOpenChange === "function" ? onOpenChange : internalSetOpen,
    placement: placeCenter ? "bottom" : (placement ?? "bottom-start"),
    middleware: [
      offsetMiddleware(
        placeCenter
          ? ({ rects }) =>
              -rects.reference.height / 2 - rects.floating.height / 2
          : offset,
      ),
      flip(),
      shift(),
    ],
    whileElementsMounted: autoUpdate,
  });

  return (
    <DropdownContext.Provider
      value={{
        background,
        context: context,
      }}
    >
      {children}
    </DropdownContext.Provider>
  );
};

export { Dropdown, DropdownContent, DropdownTrigger };
