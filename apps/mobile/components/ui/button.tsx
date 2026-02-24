import type { VariantProps } from "class-variance-authority";
import { Pressable, Text } from "react-native";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { Spinner } from "@/components/ui/spinner";

const buttonVariants = cva(
  cn("group shrink-0 flex-row items-center justify-center gap-2 rounded-md shadow-none"),
  {
    variants: {
      variant: {
        default: cn("bg-primary shadow-sm shadow-black/5 active:bg-primary/90"),
        destructive: cn(
          "bg-destructive shadow-sm shadow-black/5 active:bg-destructive/90 dark:bg-destructive/60",
        ),
        outline: cn(
          "border border-border bg-background shadow-sm shadow-black/5 active:bg-accent dark:border-input dark:bg-input/30 dark:active:bg-input/50",
        ),
        secondary: cn("bg-secondary shadow-sm shadow-black/5 active:bg-secondary/80"),
        ghost: cn("active:bg-accent dark:active:bg-accent/50"),
        link: cn(""),
      },
      size: {
        default: cn("h-10 px-4 py-2 sm:h-9"),
        sm: cn("h-9 gap-1.5 rounded-md px-3 sm:h-8"),
        lg: cn("h-11 rounded-md px-6 sm:h-10"),
        icon: "h-10 w-10 sm:h-9 sm:w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const buttonTextVariants = cva("text-foreground text-sm font-medium", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      destructive: "text-white",
      outline: cn("group-active:text-accent-foreground"),
      secondary: "text-secondary-foreground",
      ghost: "group-active:text-accent-foreground",
      link: cn("text-primary group-active:underline"),
    },
    size: {
      default: "",
      sm: "",
      lg: "text-lg font-semibold",
      icon: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

const buttonSpinnerVariants = cva("", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      destructive: "text-white",
      outline: "text-foreground",
      secondary: "text-secondary-foreground",
      ghost: "text-foreground",
      link: "text-primary",
    },
    size: {
      default: "h-4 w-4",
      sm: "h-4 w-4",
      lg: "h-5 w-5",
      icon: "h-4 w-4",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type ButtonProps = React.ComponentProps<typeof Pressable> &
  React.RefAttributes<typeof Pressable> &
  VariantProps<typeof buttonVariants> & {
    text: string;
    loading?: boolean;
  };

function Button({ className, variant, size, loading = false, text, disabled, ...props }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      className={cn(isDisabled && "opacity-50", buttonVariants({ variant, size }), className)}
      role="button"
      {...props}
      disabled={isDisabled}
    >
      {loading ? (
        <Spinner className={cn(buttonSpinnerVariants({ variant, size }))} />
      ) : (
        <Text className={cn(buttonTextVariants({ variant, size }))}>{text}</Text>
      )}
    </Pressable>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
