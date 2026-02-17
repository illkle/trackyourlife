import { Text, View } from "react-native";
import React from "react";
import { ServerSelectForm } from "@/components/auth/serverSelectForm";
import { DefaultWrapper } from "@/lib/styledComponents";

const Content = () => {
  return (
    <>
      <View className="p-safe">
        <Text className="mx-auto text-5xl font-black text-primary">TYL</Text>
      </View>
      <ServerSelectForm />
    </>
  );
};

export default function Screen() {
  return (
    <DefaultWrapper>
      <View>
        <Content />
      </View>
    </DefaultWrapper>
  );
}
