import { Text } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Button } from "@/components/ui/button";
import { setupPowerSync } from "@/db/powersync";
import { authClient } from "@/lib/authClient";
import { styled } from "nativewind";

const KASV = styled(KeyboardAwareScrollView, { className: "style" });

export default function HomeScreen() {
  const session = authClient.useSession();

  return (
    <KASV className="bg-background px-4">
      <Text className="text-primary mt-4">
        Session: {JSON.stringify(session.data, null, 2)}
      </Text>

      <Button text="setup" onPress={() => void setupPowerSync()}></Button>
    </KASV>
  );
}
