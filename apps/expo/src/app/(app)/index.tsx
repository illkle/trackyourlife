import { useMemo } from "react";
import {
  FlatList,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHookstate } from "@hookstate/core";
import { FlashList } from "@shopify/flash-list";
import { eachDayOfInterval, format, sub } from "date-fns";
import { asc, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { RadixIcon } from "radix-ui-react-native-icons";

import { sortTrackableList } from "@tyl/helpers/trackables";

import DayCellWrapper from "~/app/_components/dayCell";
import { TrackableProvider } from "~/app/_components/trackableProvider";
import { Button } from "~/app/_ui/button";
import { currentUserSettings } from "~/data/authContext";
import { isSyncing, lastSync, syncError } from "~/data/syncContext";
import { tws } from "~/utils/tw";

/*
const Today = () => {
  const now = new Date();
  return (
    <DayCellWrapper
      day={now.getDate()}
      month={now.getMonth()}
      year={now.getFullYear()}
    ></DayCellWrapper>
  );
};
*/

const DateView = ({ date }: { date: Date }) => {
  const { data } = useLiveQuery(
    db.query.trackable.findMany({
      orderBy: [asc(trackable.name)],
      where: eq(trackable.isDeleted, false),
    }),
  );

  const colorScheme = useColorScheme();

  const favorites = useHookstate(currentUserSettings.favorites);

  const { width } = useWindowDimensions();

  const sorted = useMemo(() => {
    const s = sortTrackableList(data, favorites.get() as string[]);
    return s;
  }, [favorites, data]);

  return (
    <>
      <SafeAreaView edges={["top"]} />
      <View
        style={[
          tws(
            " px-4 flex flex-row items-center justify-between pb-2 overflow-hidden",
          ),
          { width: width },
        ]}
      >
        <Text style={tws("text-color-base text-4xl font-extrabold")}>
          <Text>{format(date, "EEEE")} </Text>
          <Text style={[tws("font-semibold text-2xl opacity-80")]}>
            {format(date, "d MMM")}
          </Text>
        </Text>

        <View style={[tws("flex flex-row gap-2")]}></View>
      </View>
      <View style={{ flex: 1 }}>
        <FlatList
          data={sorted}
          keyExtractor={(v) => v.id}
          numColumns={2}
          contentContainerStyle={tws("px-4 pb-4")}
          ListHeaderComponent={() => {
            return <></>;
          }}
          renderItem={(v) => (
            <View
              style={[tws("py-1 flex-1", v.index % 2 == 0 ? "pr-2" : "pl-2")]}
              key={v.item.id}
            >
              <View style={[tws("flex flex-row justify-between items-center")]}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={tws(
                    "text-lg text-neutral-900 opacity-30 dark:opacity-20 dark:text-neutral-50",
                  )}
                >
                  {v.item.name}
                </Text>
                <View>
                  {favorites.get().includes(v.item.id) && (
                    <RadixIcon
                      name="heart-filled"
                      size={12}
                      color={colorScheme === "light" ? "#525252" : "#d4d4d4"}
                    />
                  )}
                </View>
              </View>
              <TrackableProvider trackable={v.item}>
                <DayCellWrapper
                  labelType="none"
                  day={date.getDate()}
                  month={date.getMonth()}
                  year={date.getFullYear()}
                ></DayCellWrapper>
              </TrackableProvider>
            </View>
          )}
        />
      </View>
    </>
  );
};

const DAYS = 7;

export default function Index() {
  const { height, width } = useWindowDimensions();

  const dates = eachDayOfInterval({
    start: new Date(),
    end: sub(new Date(), { days: DAYS }),
  });

  const ls = useHookstate(lastSync);

  const isInProgress = useHookstate(isSyncing);

  const err = useHookstate(syncError);

  if (!ls.get()) {
    return (
      <View>
        <View style={tws("flex h-full items-center justify-center")}>
          <View style={tws("flex flex-col  items-center justify-center px-4")}>
            {isInProgress.get() ? (
              <Text style={tws("text-color-base font-bold")}>
                Syncing data, please wait...
              </Text>
            ) : (
              <View>
                <Text style={tws("text-color-base font-bold text-center")}>
                  {err.get()
                    ? err.get()
                    : " Data is outdated and sync is not running.\n This is unusual error."}
                </Text>
                <Button style={tws("mt-4")} variant={"outline"}>
                  Sync
                </Button>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }

  return <DateView date={new Date()} />;

  return (
    <>
      <View style={{ width, height }}>
        <FlashList
          snapToInterval={width}
          horizontal={true}
          data={dates}
          nestedScrollEnabled={true}
          renderItem={(i) => (
            <View style={{ width, height }}>
              <DateView date={i.item} />
            </View>
          )}
          snapToAlignment="center"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          estimatedItemSize={width}
          inverted={true}
        ></FlashList>
      </View>
    </>
  );
}
