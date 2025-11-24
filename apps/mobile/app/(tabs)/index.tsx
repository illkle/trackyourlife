import { Text, View } from "react-native";
import { SignInForm } from "@/components/sign-in-form";

export default function HomeScreen() {
  return (
    <View className="pt-safe dark px-4">
      <View className="h-30 w-20 rounded-md border-2 border-blue-500 bg-red-400">
        <Text className="text-blue">hello</Text>
      </View>
      <SignInForm />
    </View>
  );
}
