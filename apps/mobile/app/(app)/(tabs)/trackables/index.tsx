import { Text, View } from "react-native";
import { Link } from "expo-router";
import { useTrackablesList } from "@tyl/helpers/data/dbHooks";
import { DefaultWrapper } from "@/lib/styledComponents";

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

export default function HomeScreen() {
  return (
    <DefaultWrapper>
      <TrackableList />
    </DefaultWrapper>
  );
}
