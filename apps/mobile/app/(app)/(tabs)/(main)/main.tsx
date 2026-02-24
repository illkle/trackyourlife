import { Fragment, useMemo } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { eachDayOfInterval, format, isLastDayOfMonth, subDays } from 'date-fns';

import { TrackableMetaProvider } from '@tyl/helpers/data/TrackableMetaProvider';
import { TrackableDataProvider } from '@tyl/helpers/data/TrackableDataProvider';
import { DefaultWrapper } from '@/lib/styledComponents';
import { Button } from '@/components/ui/button';
import { DayCellRouter } from '@/components/cells';
import { useTrackablesList } from '@tyl/helpers/data/dbHooksTanstack';

const SHOW_DAYS = 7;

const EmptyList = () => {
  return (
    <View className="items-center justify-center py-12">
      <Text className="text-xl font-light text-foreground">
        You do not have any trackables yet.
      </Text>
      <Link href="/create" asChild className="mt-4">
        <Button variant="outline" text="Create Trackable" />
      </Link>
    </View>
  );
};

const TodayList = () => {
  const range = useMemo(() => {
    const lastDay = new Date();
    return {
      firstDay: subDays(lastDay, SHOW_DAYS),
      lastDay,
    };
  }, []);

  const q = useTrackablesList();

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: range.lastDay,
        end: range.firstDay,
      }),
    [range]
  );

  if (q.isLoading) {
    return (
      <TrackableDataProvider firstDay={range.firstDay} lastDay={range.lastDay}>
        <View className="items-center justify-center py-12">
          <Text className="text-muted-foreground">Loading trackables...</Text>
        </View>
      </TrackableDataProvider>
    );
  }

  if (!q.data || q.data.length === 0) {
    return (
      <TrackableDataProvider firstDay={range.firstDay} lastDay={range.lastDay}>
        <EmptyList />
      </TrackableDataProvider>
    );
  }

  const screenWidth = Dimensions.get('window').width - 32; // sub side padding
  const cellWidth = (screenWidth - 8) / 2; // sub gap between cells

  return (
    <TrackableDataProvider firstDay={range.firstDay} lastDay={range.lastDay}>
      <View className="flex flex-col gap-6 pb-6">
        {days.map((date, dateIndex) => (
          <Fragment key={date.toISOString()}>
            <View className="flex flex-col gap-3">
              <View className="flex flex-col gap-1">
                {(isLastDayOfMonth(date) || dateIndex === 0) && (
                  <Text className="text-2xl font-semibold text-foreground">
                    {format(date, 'MMMM')}
                  </Text>
                )}
                <View className="flex flex-row items-baseline gap-2">
                  <Text className="text-lg text-muted-foreground">
                    {format(date, 'EEEE')}
                  </Text>
                  <Text className="text-lg font-semibold text-foreground">
                    {format(date, 'd')}
                  </Text>
                </View>
              </View>

              <View className="flex flex-row flex-wrap gap-2">
                {q.data.map(({ trackable }) => (
                  <TrackableMetaProvider key={trackable.id} trackable={trackable}>
                    <View style={{ width: cellWidth }}>
                      <Link href={`/trackable/${trackable.id}`} className="py-1">
                        <Text className="text-base text-muted-foreground">
                          {trackable.name}
                        </Text>
                      </Link>

                      <View>
                        <DayCellRouter timestamp={date} labelType={'none'} />
                      </View>
                    </View>
                  </TrackableMetaProvider>
                ))}
              </View>
            </View>
            {dateIndex !== days.length - 1 && (
              <View className="border-b border-border" />
            )}
          </Fragment>
        ))}
      </View>
    </TrackableDataProvider>
  );
};

export const HomeScreen = () => {
  return (
    <DefaultWrapper>
      <TodayList />
    </DefaultWrapper>
  );
};

export default HomeScreen;
