import { useMemo } from "react";
import {
  FlatList,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { useHookstate } from "@hookstate/core";
import { FlashList } from "@shopify/flash-list";
import { eachDayOfInterval, sub } from "date-fns";
import { asc, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { RadixIcon } from "radix-ui-react-native-icons";

import { sortTrackableList } from "@tyl/helpers/trackables";

import DayCellWrapper from "~/app/_components/dayCell";
import { TrackableProvider } from "~/app/_components/trackableProvider";
import { Input } from "~/app/_ui/input";
import { currentUserSettings } from "~/data/authContext";
import { trackable } from "~/db/schema";
import { db } from "~/drizzle/db";
import { tws } from "~/utils/tw";

const DAYS = 7;

export default function Index() {
  const { data } = useLiveQuery(
    db.query.trackable.findMany({
      orderBy: [asc(trackable.name)],
      where: eq(trackable.isDeleted, false),
    }),
  );

  const favorites = useHookstate(currentUserSettings.favorites);

  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();

  const sorted = useMemo(() => {
    const s = sortTrackableList(data, favorites.get() as string[]);
    return s;
  }, [favorites, data]);

  // const date = new Date();

  const dates = eachDayOfInterval({
    start: new Date(),
    end: sub(new Date(), { days: DAYS }),
  });

  return (
    <>
      <SafeAreaView edges={["top"]} />
      <View style={[tws("px-4")]}>
        <Text style={tws("text-color-base text-4xl font-extrabold")}>
          Trackables
        </Text>

        <Input placeholder="Search by name" style={[tws("my-2")]} />
      </View>

      <FlatList
        // ref={listRef}
        data={sorted}
        keyExtractor={(v) => v.id}
        //  itemLayoutAnimation={LinearTransition}
        contentContainerStyle={tws("pb-4")}
        renderItem={(v) => {
          return (
            <View style={[tws("py-1 w-full")]}>
              <Link
                style={[tws("w-full")]}
                href={{
                  pathname: "/(app)/trackables/[trackableId]",
                  params: { trackableId: v.item.id },
                }}
              >
                <View
                  style={[
                    tws(
                      "flex px-4 w-full flex-row justify-between items-center",
                    ),
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      tws(
                        "text-xl font-semibold py-1.5 text-neutral-900  dark:text-neutral-50",
                      ),
                      { width: width - 32 - 18 - 8 },
                    ]}
                  >
                    {v.item.name}
                  </Text>

                  {favorites.get().includes(v.item.id) && (
                    <RadixIcon
                      name={"heart-filled"}
                      size={18}
                      color={colorScheme === "light" ? "#525252" : "#d4d4d4"}
                    />
                  )}
                </View>
              </Link>
              <TrackableProvider trackable={v.item}>
                <FlashList
                  contentContainerStyle={tws("px-4")}
                  estimatedItemSize={128}
                  ItemSeparatorComponent={() => (
                    <View style={{ width: 4 }}></View>
                  )}
                  data={dates}
                  renderItem={(v) => (
                    <DayCellWrapper
                      labelType="outside"
                      style={tws("w-40 h-20")}
                      day={v.item.getDate()}
                      month={v.item.getMonth()}
                      year={v.item.getFullYear()}
                    ></DayCellWrapper>
                  )}
                  horizontal={true}
                  inverted={true}
                />
              </TrackableProvider>
            </View>
          );
        }}
      />
    </>
  );
}
