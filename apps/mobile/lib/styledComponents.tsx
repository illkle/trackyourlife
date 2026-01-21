import { styled } from "nativewind";

import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

export const KASV = styled(KeyboardAwareScrollView, { className: "style" });

export const DefaultWrapper = ({ children }: { children: React.ReactNode }) => {
  return <KASV className="bg-background px-4">{children}</KASV>;
};
