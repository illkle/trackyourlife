import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { LayoutGroup, m } from "motion/react";

import { cn } from "../utils";

const RadioTabs = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <LayoutGroup id={id}>
      <RadioGroupPrimitive.Root
        className={cn(
          "flex h-11 items-stretch justify-center rounded-lg bg-neutral-100 p-1 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
          className,
        )}
        {...props}
        ref={ref}
      />
    </LayoutGroup>
  );
});
RadioTabs.displayName = RadioGroupPrimitive.Root.displayName;

const RadioTabItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  return (
    <>
      <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center rounded-md px-3 text-sm font-medium whitespace-nowrap ring-offset-white transition-all focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 data-[state=checked]:text-neutral-950 data-[state=checked]:shadow-sm dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300 dark:data-[state=checked]:text-neutral-50",
          className,
        )}
        {...props}
      >
        <div className="relative z-10">{children}</div>

        <RadioGroupPrimitive.Indicator asChild>
          <m.div
            layout
            initial={false}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            layoutId={`indicator-tabs`}
            className="absolute z-1 h-4 h-full w-full rounded-md bg-white dark:bg-neutral-950"
          />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
    </>
  );
});
RadioTabItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioTabs, RadioTabItem };
