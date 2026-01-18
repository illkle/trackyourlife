import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthForm } from "@/components/auth/authForm";
import { styled } from "nativewind";

const KASV = styled(KeyboardAwareScrollView, { className: "style" });

export default function Screen() {
  return (
    <SafeAreaView>
      <KASV className="bg-background px-4 py-10">
        <View>
          <Text className="mx-auto text-5xl font-black text-primary">TYL</Text>
        </View>
        <Text className={"font-black"} style={{ fontWeight: "600" }}>
          asdasd
        </Text>
        <AuthForm />
      </KASV>
    </SafeAreaView>
  );
}
