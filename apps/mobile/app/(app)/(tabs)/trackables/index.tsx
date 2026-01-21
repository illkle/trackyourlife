import { Text, View } from "react-native";
import { Link } from "expo-router";
import { useTrackablesList } from "@tyl/helpers/data/dbHooks";
import { CellBoolean } from "@/components/cells/Boolean";
import { useState } from "react";
import { DefaultWrapper } from "@/lib/styledComponents";
import { CellNumber } from "@/components/cells/Number";

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
  const [numberValue, setNumberValue] = useState(0);

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

      <CellNumber value={numberValue} onChange={setNumberValue} />
    </View>
  );
};

export default function HomeScreen() {
  return (
    <DefaultWrapper>
      <TestingComponent />

      <TrackableList />
    </DefaultWrapper>
  );
}
