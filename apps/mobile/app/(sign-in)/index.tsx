import { Text, View } from "react-native";
import React from "react";
import { ServerSelectForm } from "@/components/auth/serverSelectForm";
import { DefaultWrapper } from "@/lib/styledComponents";

export default function Screen() {
  return (
    <DefaultWrapper>
      <View>
        <Text className="mx-auto text-5xl font-black text-primary">TYL</Text>
      </View>
      <ServerSelectForm />
    </DefaultWrapper>
  );
}
