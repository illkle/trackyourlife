import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Button } from "@/components/ui/button";
import { powersync, setupPowerSync } from "@/db/powersync";
import { authClient } from "@/lib/authClient";
import { styled } from "nativewind";

const KASV = styled(KeyboardAwareScrollView, { className: "style" });

const List = () => {
  const [lists, setLists] = useState([]);

  useEffect(() => {
    const f = async () => {
      const res = await powersync.getAll("SELECT * from lists");
      // @ts-ignore
      setLists(res);
    };
    void f();
  }, []);

  return (
    <View>
      <Text>{JSON.stringify(lists)}</Text>
    </View>
  );
};

export default function HomeScreen() {
  const session = authClient.useSession();

  return (
    <KASV className="bg-background px-4">
      <Text className="text-primary mt-4">
        Session: {JSON.stringify(session.data?.user.email, null, 2)}
      </Text>

      <List />

      <Button text="setup" onPress={() => void setupPowerSync()}></Button>
    </KASV>
  );
}
