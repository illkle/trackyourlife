import { useLayoutEffect } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { format } from "date-fns";
import { CalendarDaysIcon } from "lucide-react-native";

import type { IColorCodingValueInput } from "@tyl/db/jsonValidators";
import { presetsMap } from "@tyl/helpers/colorTools";
import { TrackableMetaProvider, useTrackableMeta } from "@tyl/helpers/data/TrackableMetaProvider";
import { useTrackable, useTrackableFlag } from "@tyl/helpers/data/dbHooksTanstack";

import { AppErrorBoundary } from "@/components/error/appErrorBoundary";
import { BetterNumberInput } from "@/components/inputs/colors/betterNumberInput";
import { ColorInput } from "@/components/inputs/colors/colorInput";
import { NumberColorSelector } from "@/components/inputs/colors/numberColorSelector";
import { DateInput } from "@/components/inputs/date/dateInput";
import { DefaultWrapper } from "@/lib/styledComponents";
import { useIconColor } from "@/lib/utils";

const SettingRow = ({
  label,
  children,
  right,
}: {
  label: string;
  children?: React.ReactNode;
  right?: React.ReactNode;
}) => {
  return (
    <View className="gap-2">
      <View className="mt-4 flex-row items-center gap-3">
        <Text className="text-base font-bold text-primary">{label}</Text>
        {right}
      </View>
      {children}
    </View>
  );
};

const NumberLimitsSelector = ({
  min,
  max,
  onChange,
}: {
  min: number;
  max: number;
  onChange: (next: { min: number; max: number }) => void;
}) => {
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between px-1">
        <Text className="text-xs text-muted-foreground">0%</Text>
        <Text className="text-xs text-muted-foreground">100%</Text>
      </View>
      <View className="flex-row gap-2">
        <BetterNumberInput
          value={min}
          onChange={(nextMin) => {
            onChange({ min: Math.min(nextMin, max - 1), max });
          }}
          className="h-10 flex-1"
        />
        <BetterNumberInput
          value={max}
          onChange={(nextMax) => {
            onChange({ min, max: Math.max(nextMax, min + 1) });
          }}
          className="h-10 flex-1"
        />
      </View>
    </View>
  );
};

const SettingsCommon = () => {
  const { id } = useTrackableMeta();
  const { data: trackingStart, setFlag, clearFlag } = useTrackableFlag(id, "AnyTrackingStart");

  return (
    <View className="gap-2">
      <SettingRow label="Tracking start">
        <DateInput
          value={trackingStart ? new Date(trackingStart) : undefined}
          onChange={(nextDate) => {
            if (nextDate) {
              void setFlag(format(nextDate, "yyyy-MM-dd"));
              return;
            }

            void clearFlag();
          }}
          limits={{
            start: new Date(1990, 0, 1),
            end: new Date(),
          }}
          title="Tracking start"
        />
      </SettingRow>
    </View>
  );
};

const SettingsBoolean = () => {
  const { id } = useTrackableMeta();
  const { data: checked, setFlag: setChecked } = useTrackableFlag(id, "BooleanCheckedColor");
  const { data: unchecked, setFlag: setUnchecked } = useTrackableFlag(id, "BooleanUncheckedColor");

  return (
    <View className="gap-2">
      <SettingRow label="Checked color">
        <ColorInput value={checked.raw} onChange={setChecked} />
      </SettingRow>

      <SettingRow label="Unchecked color">
        <ColorInput value={unchecked.raw} onChange={setUnchecked} />
      </SettingRow>
    </View>
  );
};

const SettingsNumber = () => {
  const { id } = useTrackableMeta();
  const { data: progress, setFlag: setNumberBounds } = useTrackableFlag(id, "NumberProgessBounds");
  const {
    data: { colorCoding },
    setFlag: setColorCoding,
  } = useTrackableFlag(id, "NumberColorCoding");

  return (
    <View className="gap-2">
      <SettingRow
        label="Show progress"
        right={
          <Switch
            value={Boolean(progress.progress?.enabled)}
            onValueChange={(enabled) => {
              void setNumberBounds({
                enabled,
                min: progress.progress?.min ?? 0,
                max: progress.progress?.max ?? 100,
              });
            }}
          />
        }
      >
        {progress.progress?.enabled ? (
          <NumberLimitsSelector
            min={progress.progress?.min ?? 0}
            max={progress.progress?.max ?? 100}
            onChange={(nextLimits) => {
              void setNumberBounds({
                enabled: true,
                min: nextLimits.min,
                max: nextLimits.max,
              });
            }}
          />
        ) : null}
      </SettingRow>

      <SettingRow
        label="Color coding"
        right={
          <Switch
            value={Boolean(colorCoding?.enabled)}
            onValueChange={(enabled) => {
              void setColorCoding({
                ...colorCoding,
                enabled,
                colors:
                  colorCoding?.colors && colorCoding.colors.length > 0
                    ? colorCoding.colors
                    : [
                        { point: 0, color: presetsMap.orange, id: "" },
                        { point: 50, color: presetsMap.green, id: "" },
                      ],
                timestamp: Date.now(),
              });
            }}
          />
        }
      >
        {colorCoding?.enabled ? (
          <NumberColorSelector
            value={colorCoding.colors ?? []}
            onChange={(nextColors: NonNullable<IColorCodingValueInput[]>) => {
              void setColorCoding({
                enabled: true,
                colors: nextColors,
                timestamp: Date.now(),
              });
            }}
          />
        ) : null}
      </SettingRow>
    </View>
  );
};

export const TrackableSettingsScreen = () => {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const q = useTrackable({ id });
  const navigation = useNavigation();
  const router = useRouter();
  const iconColor = useIconColor();

  const trackable = Array.isArray(q.data) ? q.data[0] : q.data;

  useLayoutEffect(() => {
    if (trackable?.name) {
      navigation.setOptions({
        title: `${trackable.name} settings`,
        headerRight: () => (
          <Pressable
            onPress={() => {
              router.replace({ pathname: "/trackable/[id]", params: { id } });
            }}
            className="h-9 w-9 items-center justify-center"
            hitSlop={8}
          >
            <CalendarDaysIcon size={18} color={iconColor} />
          </Pressable>
        ),
      });
    }
  }, [iconColor, id, navigation, router, trackable?.name]);

  if (q.isLoading) {
    return (
      <DefaultWrapper noTopSafeArea>
        <View className="py-12">
          <Text className="text-center text-muted-foreground">Loading settings...</Text>
        </View>
      </DefaultWrapper>
    );
  }

  if (!trackable) {
    return (
      <DefaultWrapper noTopSafeArea>
        <View className="py-12">
          <Text className="text-center text-destructive">Trackable not found.</Text>
        </View>
      </DefaultWrapper>
    );
  }

  return (
    <DefaultWrapper noTopSafeArea>
      <AppErrorBoundary boundaryName="trackable-settings">
        <TrackableMetaProvider trackable={trackable}>
          <SettingsCommon />
          {q.data[0]?.type === "boolean" ? <SettingsBoolean /> : null}
          {q.data[0]?.type === "number" ? <SettingsNumber /> : null}
        </TrackableMetaProvider>
      </AppErrorBoundary>
    </DefaultWrapper>
  );
};

export default TrackableSettingsScreen;
