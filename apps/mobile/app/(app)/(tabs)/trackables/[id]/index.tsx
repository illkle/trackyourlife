import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useLocalSearchParams } from "expo-router";
import { useTrackable, useTrackableRecords } from "@/db/queries";
import { styled } from "nativewind";

const KASV = styled(KeyboardAwareScrollView, { className: "style" });

const TrackableView = () => {
  const { id } = useLocalSearchParams();
  const { data } = useTrackable(id as string);
  const { data: records } = useTrackableRecords(id as string);
  return (
    <View>
      <Text className="text-primary">hello {data?.name}</Text>
      <Text className="text-primary mt-4">
        records {records?.length} {JSON.stringify(records)}
      </Text>
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
