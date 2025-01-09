import type { VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import type { PressableProps } from "react-native";
import * as React from "react";
import { Pressable, Text, View } from "react-native";
import { cva } from "class-variance-authority";

import { tw, tws } from "~/utils/tw";
import type { ISpinnerColor } from "./spinner";
import Spinner from "./spinner";

const textVariants = cva("text-sm font-medium", {
  variants: {
    variant: {
      default: "text-neutral-50 dark:text-neutral-900",
      destructive: "text-neutral-50 dark:text-neutral-50",
      outline: "text-neutral-950 dark:text-neutral-50",
      secondary: "text-neutral-950 dark:text-neutral-50",
      ghost: "text-neutral-950 dark:text-neutral-50",
    },
    size: {
      default: "font-bold",
      sm: "text-xs",
      lg: "",
      icon: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

const buttonVariants = cva(
  "flex items-center justify-center rounded-md border border-transparent opacity-100 disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-neutral-900 dark:bg-neutral-50",
        destructive: "bg-red-500 dark:bg-red-900",
        outline:
          "border border-neutral-200 bg-transparent dark:border-neutral-800",
        secondary: "bg-neutral-100 dark:bg-neutral-800",
        ghost: "",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-12 px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps
  extends PressableProps,
    VariantProps<typeof buttonVariants> {
  icon?: boolean;
  leftIcon?: React.ReactNode;
  loading?: boolean;
}

type Variants = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;

const spinnerColors: Record<Variants, ISpinnerColor> = {
  default: "secondary",
  destructive: "secondary",
  outline: "primary",
  secondary: "primary",
  ghost: "primary",
};

const Button = React.forwardRef<View, ButtonProps>(
  (
    { loading, style, variant, size, children, icon, leftIcon, ...props },
    ref,
  ) => {
    return (
      <Pressable
        style={[
          tws(buttonVariants({ variant, size })),
          typeof style === "object" && style,
        ]}
        ref={ref}
        {...props}
      >
        {loading ? (
          <View
            style={tws(
              `absolute flex h-full w-full items-center justify-center`,
            )}
          >
            <Spinner color={spinnerColors[variant ?? "default"]} width={20} />
          </View>
        ) : (
          <></>
        )}

        <View
          style={{
            opacity: loading ? 0 : 1,
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          {leftIcon ? leftIcon : <></>}

          <>
            {icon ? (
              children
            ) : (
              <Text style={tws(textVariants({ variant, size }))}>
                {children as ReactNode}
              </Text>
            )}
          </>
        </View>
      </Pressable>
    );
  },
);
Button.displayName = "Button";

export { Button };
