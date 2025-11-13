import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { LayoutGroup, m } from "motion/react";

import { cn } from "~/@shad/lib/utils";

function RadioTabs({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  const id = React.useId();
  return (
    <LayoutGroup id={id}>
      <RadioGroupPrimitive.Root
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
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <>
      <RadioGroupPrimitive.Item
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

        <RadioGroupPrimitive.Indicator asChild>
          <m.div
            layout
            initial={false}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            layoutId={`indicator-tabs`}
            className="bg-background absolute z-1 size-full rounded-md"
          />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
    </>
  );
}

export { RadioTabs, RadioTabItem };
