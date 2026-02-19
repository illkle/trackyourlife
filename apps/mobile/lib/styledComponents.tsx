import { cn } from "@/lib/utils";
import { View } from "react-native";

export const DefaultWrapper = ({
  children,
  noHorizontalPadding,
  noTopSafeArea,
}: {
  children: React.ReactNode;
  noHorizontalPadding?: boolean;
  noTopSafeArea?: boolean;
}) => {
  return (
    <View
      className={cn(
        "h-full bg-background",
        noHorizontalPadding ? "" : "px-4",
        noTopSafeArea ? "" : "pt-safe",
      )}
    >
      {children}
    </View>
  );
};
