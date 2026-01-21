import { withUniwind } from "uniwind";

import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

export const KASV = withUniwind(KeyboardAwareScrollView);

export const DefaultWrapper = ({ children }: { children: React.ReactNode }) => {
  return <KASV className="bg-card px-4">{children}</KASV>;
};
