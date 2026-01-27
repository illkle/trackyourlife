import { withUniwind } from "uniwind";

import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { cn } from "@/lib/utils";

export const KASV = withUniwind(KeyboardAwareScrollView);

export const DefaultWrapper = ({
  children,
  noPadding,
}: {
  children: React.ReactNode;
  noPadding?: boolean;
}) => {
  return <KASV className={cn("bg-background", noPadding ? "" : "px-4")}>{children}</KASV>;
};
