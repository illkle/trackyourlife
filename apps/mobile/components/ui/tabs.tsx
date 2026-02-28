import * as React from "react";
import { Pressable, Text, View } from "react-native";
import { cn } from "@/lib/utils";
type TabsValue = string;

type TabsContextValue = {
  value?: TabsValue;
  onValueChange: (nextValue: TabsValue) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

const useTabsContext = () => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within <Tabs />");
  }
  return context;
};

type TabsProps = React.ComponentPropsWithoutRef<typeof View> & {
  value?: TabsValue;
  defaultValue?: TabsValue;
  onValueChange?: (value: TabsValue) => void;
};

export const Tabs = React.forwardRef<React.ElementRef<typeof View>, TabsProps>(
  ({ className, value, defaultValue, onValueChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState<TabsValue | undefined>(defaultValue);
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const handleValueChange = React.useCallback(
      (nextValue: TabsValue) => {
        if (!isControlled) {
          setInternalValue(nextValue);
        }
        onValueChange?.(nextValue);
      },
      [isControlled, onValueChange],
    );

    return (
      <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
        <View ref={ref} className={cn(className)} {...props} />
      </TabsContext.Provider>
    );
  },
);
Tabs.displayName = "Tabs";

type TabsListProps = React.ComponentPropsWithoutRef<typeof View>;

export const TabsList = React.forwardRef<React.ElementRef<typeof View>, TabsListProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn(
          "h-11 w-full flex-row items-stretch justify-center rounded-lg bg-muted p-1 text-muted-foreground",
          className,
        )}
        {...props}
      />
    );
  },
);
TabsList.displayName = "TabsList";

type TabsTriggerProps = React.ComponentPropsWithoutRef<typeof Pressable> & {
  value: TabsValue;
  text?: string;
};

export const TabsTrigger = React.forwardRef<React.ElementRef<typeof Pressable>, TabsTriggerProps>(
  ({ className, text, value, disabled, onPress, children, ...props }, ref) => {
    const { value: currentValue, onValueChange } = useTabsContext();
    const isActive = currentValue === value;

    return (
      <Pressable
        ref={ref}
        className={cn(
          "relative inline-flex grow items-center justify-center rounded-md px-3 text-sm",
          "font-medium whitespace-nowrap",
          isActive && "bg-background",
          disabled && "opacity-50",
          className,
        )}
        disabled={disabled}
        onPress={(event) => {
          onPress?.(event);
          if (!disabled) {
            onValueChange(value);
          }
        }}
        {...props}
      >
        <>
          {text && (
            <Text
              className={cn("font-bold", isActive ? "text-foreground" : "text-muted-foreground")}
            >
              {text}
            </Text>
          )}
          {children}
        </>
      </Pressable>
    );
  },
);
TabsTrigger.displayName = "TabsTrigger";

type TabsContentProps = React.ComponentPropsWithoutRef<typeof View> & {
  value: TabsValue;
};

export const TabsContent = React.forwardRef<React.ElementRef<typeof View>, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const { value: currentValue } = useTabsContext();

    if (currentValue !== value) {
      return null;
    }

    return <View ref={ref} className={cn(className)} {...props} />;
  },
);
TabsContent.displayName = "TabsContent";
