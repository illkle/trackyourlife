import * as React from "react";

import { cn } from "~/@shad/lib/utils";

const CardPressable = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "bg-card text-card-foreground cursor-pointer rounded-xl border shadow disabled:cursor-not-allowed disabled:opacity-30",
      className,
    )}
    {...props}
  />
));
CardPressable.displayName = "CardPressable";

export { CardPressable };
