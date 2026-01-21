import { View, Text } from "react-native";
import { DefaultWrapper } from "@/lib/styledComponents";

export default function HomeScreen() {
  return (
    <DefaultWrapper>
      <View className="h-100 flex-1 items-center justify-center bg-red-500">
        <Text className="bg-blue-400">Hello</Text>
      </View>
      <View className="h-100 flex-1 items-center justify-center bg-yellow-500">
        <Text>Hello</Text>
      </View>
      <View className="h-100 flex-1 items-center justify-center bg-blue-500">
        <Text>Hello</Text>
      </View>
    </DefaultWrapper>
  );
}
