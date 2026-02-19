import { cn } from "@/lib/utils";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { withUniwind } from "uniwind";

const KASV = withUniwind(KeyboardAwareScrollView);

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
    <View className={cn("h-full bg-background")}>
      <KASV className={cn(noHorizontalPadding ? "" : "px-4", noTopSafeArea ? "" : "pt-safe")}>
        <View className="pb-safe">{children}</View>
      </KASV>
    </View>
  );
};
