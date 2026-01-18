import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Link } from "expo-router";
import { useTrackablesList } from "@/db/queries";
import { styled } from "nativewind";

const KASV = styled(KeyboardAwareScrollView, { className: "style" });

const TrackableList = () => {
  const data = useTrackablesList();

  return (
    <View>
      {data.data?.map((trackable) => (
        <Link key={trackable.id} className="py-4" href={`/trackables/${trackable.id}`}>
          <Text className="text-primary">{trackable.name}</Text>
        </Link>
      ))}
    </View>
  );
};

export default function HomeScreen() {
  return (
    <KASV className="bg-background px-4">
      <TrackableList />
    </KASV>
  );
}
