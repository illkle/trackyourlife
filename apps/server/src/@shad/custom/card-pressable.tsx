import * as React from "react";

import { cn } from "~/@shad/lib/utils";

function CardPressable({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="card-pressable"
      className={cn(
        "flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm",
        "cursor-pointer disabled:cursor-not-allowed disabled:opacity-30",
        className,
      )}
      {...props}
    />
  );
}

export { CardPressable };
