import { DefaultWrapper } from "@/lib/styledComponents";
import { Text, View } from "react-native";

export default function TabTwoScreen() {
  return (
    <DefaultWrapper>
      <View>
        <Text className="text-test">Access as a theme value</Text>
        <Text className="text-[--color-rgb]">Or the variable directly</Text>

        {/* Variables can be changed inline */}
        <View>
          <Text className="text-primary">I am now green!</Text>
          <Text className="text-[--color-rgb]">I am now blue!</Text>
        </View>
      </View>
    </DefaultWrapper>
  );
}
