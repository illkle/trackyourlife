import { Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SignInForm } from "@/components/sign-in-form";

export default function HomeScreen() {
  return (
    <KeyboardAwareScrollView>
      <View className="px-4">
        <SignInForm />
      </View>
    </KeyboardAwareScrollView>
  );
}
