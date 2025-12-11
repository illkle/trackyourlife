import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Button } from "@/components/ui/button";
import { setupPowerSync } from "@/db/powersync";
import { styled } from "nativewind";

const KASV = styled(KeyboardAwareScrollView, { className: "style" });

export default function HomeScreen() {
  return (
    <KASV className="bg-background px-4">
      <Button text="setup" onPress={() => void setupPowerSync()}></Button>
    </KASV>
  );
}
