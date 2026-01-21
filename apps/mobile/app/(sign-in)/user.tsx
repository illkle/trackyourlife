import { Text, View } from "react-native";
import { AuthForm } from "@/components/auth/authForm";
import { DefaultWrapper } from "@/lib/styledComponents";

export default function Screen() {
  return (
    <DefaultWrapper>
      <View>
        <Text className="mx-auto text-5xl font-black text-primary">TYL USER</Text>
      </View>
      <AuthForm />
    </DefaultWrapper>
  );
}
