import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/authClient";
import { styled } from "nativewind";

const KASV = styled(KeyboardAwareScrollView, { className: "style" });

export default function TabTwoScreen() {
  const session = authClient.useSession();

  return (
    <KASV className="bg-background px-4">
      <View>
        <Text className="text-primary text-2xl font-bold">User:</Text>
        <Text className="text-primary mt-2 font-mono">
          {session.data?.user?.name}
        </Text>
        <Text className="text-primary mt-1 font-mono">
          {session.data?.user?.email}
        </Text>

        <Button
          variant={"outline"}
          className="mt-4"
          text="Sign out"
          onPress={() => void authClient.signOut()}
        />
      </View>
    </KASV>
  );
}
