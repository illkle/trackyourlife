import { Text } from "react-native";
import { cn } from "@/lib/utils";
import * as TabsPrimitive from "@rn-primitives/tabs";

function Tabs({
  className,
  ...props
}: TabsPrimitive.RootProps & React.RefAttributes<TabsPrimitive.RootRef>) {
  return <TabsPrimitive.Root className={cn(className)} {...props} />;
}

function TabsList({
  className,
  ...props
}: TabsPrimitive.ListProps & React.RefAttributes<TabsPrimitive.ListRef>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "bg-muted text-muted-foreground h-11 w-full flex-row items-stretch justify-center rounded-lg p-1",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  text,
  ...props
}: TabsPrimitive.TriggerProps &
  React.RefAttributes<TabsPrimitive.TriggerRef> & {
    text?: string;
  }) {
  const { value } = TabsPrimitive.useRootContext();
  const isActive = value === props.value;
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "relative inline-flex grow items-center justify-center rounded-md px-3 text-sm",
        "whitespace-nowrap font-medium",
        isActive && "bg-background",
        className,
      )}
      {...props}
    >
      <>
        {text && (
          <Text
            className={cn(
              "font-bold",
              isActive ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {text}
          </Text>
        )}
        {props.children}
      </>
    </TabsPrimitive.Trigger>
  );
}

function TabsContent({
  className,
  ...props
}: TabsPrimitive.ContentProps & React.RefAttributes<TabsPrimitive.ContentRef>) {
  return <TabsPrimitive.Content className={cn(className)} {...props} />;
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
