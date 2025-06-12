/**
 * Inspired by https://vaul.emilkowal.ski/
 * decided to write my own version becuase ther one isn't what we need on desktop
 * and in 1.0 version they broke stuff that I fixed for mobile inputs with autofocus :(
 */

import type { HTMLMotionProps } from "motion/react";
import React from "react";
import { m } from "motion/react";

import { useSidebar } from "~/@shad/components/sidebar";
import { cn } from "~/@shad/utils";

export const GoodDrawer = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div">
>(({ children, ...props }, ref) => {
  const { state, isMobile } = useSidebar();

  return (
    <m.div
      transition={{ duration: 2, ease: "easeInOut" }}
      data-sidebar-offset={isMobile ? false : state === "expanded"}
      className={cn(
        "fixed bottom-0 left-1/2 z-50",
        "data-[state=closed]:translate-y-full data-[state=closed]:opacity-0",
        "data-[state=collapsed]:translate-y-[calc(100%-24px)]",
        "data-[sidebar-offset=false]:-translate-x-1/2 data-[sidebar-offset=true]:translate-x-[calc(-50%+var(--sidebar-offset)/2)]",
        "transition-all",
        "data-[hidden=true]:pointer-events-none data-[hidden=true]:opacity-0",
        props.className,
      )}
      {...props}
    >
      <m.div
        ref={ref}
        style={{
          transformOrigin: "bottom",
        }}
        className={cn(
          "h-fit max-h-[200px] w-[500px] max-w-[100vw] rounded-t-md border border-b-0 shadow-2xl",
          "border-neutral-200 dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-neutral-950",
        )}
      >
        {children}
      </m.div>
    </m.div>
  );
});
