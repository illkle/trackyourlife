import * as React from "react";
import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { LayoutGroup, m } from "motion/react";

import { cn } from "~/@shad/lib/utils";

function RadioTabs({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive>) {
  const id = React.useId();
  return (
    <LayoutGroup id={id}>
      <RadioGroupPrimitive
        className={cn(
          "flex h-11 items-stretch justify-center rounded-lg bg-muted p-1 text-muted-foreground",
          className,
        )}
        {...props}
      />
    </LayoutGroup>
  );
}

function RadioTabItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof RadioPrimitive.Root>) {
  return (
    <RadioPrimitive.Root
      className={cn(
        "relative inline-flex items-center justify-center rounded-md px-3 text-sm",
        "font-medium whitespace-nowrap transition-all",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50",
        "data-[state=checked]:text-foreground data-[state=checked]:shadow-sm",
        className,
      )}
      {...props}
    >
      <div className="relative z-10">{children}</div>

      <RadioPrimitive.Indicator
        render={
          <m.div
            layout
            initial={false}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            layoutId={`indicator-tabs`}
            className="absolute z-1 size-full rounded-md bg-background"
          />
        }
      ></RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
}

export { RadioTabs, RadioTabItem };
