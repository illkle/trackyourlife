import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTrackable } from "@tyl/helpers/data/dbHooks";
import { DefaultWrapper } from "@/lib/styledComponents";

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
    <DefaultWrapper>
      <TrackableView />
    </DefaultWrapper>
  );
}
