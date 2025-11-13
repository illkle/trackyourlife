import * as React from "react";

import { cn } from "~/@shad/lib/utils";

function CardPressable({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="card-pressable"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        "cursor-pointer disabled:cursor-not-allowed disabled:opacity-30",
        className,
      )}
      {...props}
    />
  );
}

export { CardPressable };
