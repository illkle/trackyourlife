import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Link } from "expo-router";
import { styled } from "nativewind";
import { useTrackablesList } from "@tyl/helpers/data/dbHooks";
import { CellBoolean } from "@/components/cells/Boolean";
import { useState } from "react";

const KASV = styled(KeyboardAwareScrollView, { className: "style" });

const TrackableList = () => {
  const { data } = useTrackablesList();

  return (
    <View>
      {data?.map((trackable) => (
        <Link key={trackable.id} className="py-4" href={`/trackables/${trackable.id}`}>
          <Text className="text-primary">{trackable.name}</Text>
        </Link>
      ))}
    </View>
  );
};

const TestingComponent = () => {
  const [value, setValue] = useState(false);

  return (
    <View>
      <CellBoolean
        value={value}
        onChange={setValue}
        themeActiveLight="red"
        themeActiveDark="red"
        themeInactiveLight="blue"
        themeInactiveDark="blue"
      />
    </View>
  );
};

export default function HomeScreen() {
  return (
    <KASV className="bg-background px-4">
      <TestingComponent />

      <TrackableList />
    </KASV>
  );
}
