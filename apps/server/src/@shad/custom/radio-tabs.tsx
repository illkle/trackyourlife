import * as React from "react";
import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { LayoutGroup, m } from "motion/react";

import { cn } from "~/@shad/lib/utils";

function RadioTabs({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive>) {
  const id = React.useId();
  return (
    <LayoutGroup id={id}>
      <RadioGroupPrimitive
        className={cn(
          "bg-muted text-muted-foreground flex h-11 items-stretch justify-center rounded-lg p-1",
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
        "whitespace-nowrap font-medium transition-all",
        "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
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
            className="bg-background z-1 absolute size-full rounded-md"
          />
        }
      ></RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
}

export { RadioTabs, RadioTabItem };
