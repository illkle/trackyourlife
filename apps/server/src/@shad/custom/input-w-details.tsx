import * as React from "react";

import { cn } from "~/@shad/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  isValid?: boolean;
  error?: string | boolean;
  warning?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, isValid, error, warning, ...props }, ref) => {
    return (
      <div className="flex flex-col">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border-2 border-neutral-200 bg-transparent px-3 py-1 shadow-xs outline-offset-2 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300",
            className,
            isValid && "border-lime-500 dark:border-lime-600",
            warning && "border-orange-500 dark:border-orange-500",
            error && "border-red-500 dark:border-red-600",
          )}
          ref={ref}
          {...props}
        />
        {error && typeof error === "string" && (
          <div className="mt-1 text-xs text-red-500 dark:text-red-600">
            {error}
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
