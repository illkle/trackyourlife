import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useLocalSearchParams } from "expo-router";
import { styled } from "nativewind";
import { useTrackable } from "@tyl/helpers/data/dbHooks";

const KASV = styled(KeyboardAwareScrollView, { className: "style" });

const TrackableView = () => {
  const { id } = useLocalSearchParams();
  const { data } = useTrackable({ id: id as string });
  return (
    <View>
      <Text className="text-primary">hello </Text>
      <Text className="mt-4 text-primary">{JSON.stringify(data)}</Text>
    </View>
  );
};

export default function HomeScreen() {
  return (
    <KASV className="bg-background px-4">
      <TrackableView />
    </KASV>
  );
}
