import type { ReactNode } from "react";
import { useMemo } from "react";
import type { ViewStyle } from "react-native";
import { Text, View } from "react-native";

import type { ITrackable } from "@tyl/validators/trackable";
import { computeDayCellHelpers } from "@tyl/helpers/trackables";

import { useTrackableContextSafe } from "~/app/_components/trackableProvider";
import { tws } from "~/utils/tw";
import { DayCellBoolean } from "./dayCellBoolean";
import { DayCellNumber } from "./dayCellNumber";
import { DayCellRange } from "./dayCellRange";

export const DayCellBaseClasses = "relative rounded-sm h-[80px]";

const DayCellInner = ({
  type,
  value,
  children,
  outOfRange = false,
  style,
  dateDay,
  onChange,
  size,
}: {
  children?: ReactNode;
  type: ITrackable["type"];
  value?: string;
  outOfRange?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  dateDay: Date;
  size: DayCellSize;
  onChange: (v: string) => void | Promise<void>;
}) => {
  if (outOfRange)
    return (
      <View style={[tws("bg-neutral-100 dark:bg-neutral-900"), style]}>
        {children}
      </View>
    );

  if (type === "boolean") {
    return (
      <DayCellBoolean style={style} value={value} onChange={onChange}>
        {children}
      </DayCellBoolean>
    );
  }

  if (type === "number") {
    return (
      <DayCellNumber
        style={style}
        value={value}
        onChange={onChange}
        dateDay={dateDay}
        size={size}
      >
        {children}
      </DayCellNumber>
    );
  }

  if (type === "range") {
    return (
      <DayCellRange
        dateDay={dateDay}
        style={style}
        value={value}
        onChange={onChange}
      >
        {children}
      </DayCellRange>
    );
  }

  throw new Error("Unsupported trackable type");
};

export type DayCellSize = "s" | "m";

const DayCellWrapper = ({
  day,
  month,
  year,
  style,
  styleWrapper,
  size = "m",
  labelType = "inside",
}: {
  day: number;
  month: number;
  year: number;
  style?: ViewStyle;
  styleWrapper?: ViewStyle;
  noLabel?: boolean;
  size?: DayCellSize;
  labelType?: "inside" | "outside" | "none";
}) => {
  const { type, settings, setValue, useValue } = useTrackableContextSafe();

  const { inTrackRange, isToday, dateDay, dateDayUTC } = useMemo(
    () =>
      computeDayCellHelpers({
        day,
        month,
        year,
        startDate: settings?.startDate,
        dateNow: new Date(),
      }),
    [day, month, year, settings?.startDate],
  );

  const { value } = useValue(dateDayUTC);

  const updateHandler = async (value: string) => {
    await setValue(dateDayUTC, value);
  };

  return (
    <View style={[tws("flex flex-col"), styleWrapper]}>
      {labelType === "outside" && (
        <Text
          style={[
            tws(
              "mr-1 mb-0.5 text-right font-semibold text-neutral-800 dark:text-neutral-400",
              isToday ? "font-normal underline" : "font-light",
            ),
          ]}
        >
          {day}
        </Text>
      )}
      <DayCellInner
        style={tws(DayCellBaseClasses, style)}
        type={type}
        outOfRange={!inTrackRange}
        dateDay={dateDay}
        value={value}
        onChange={updateHandler}
        size={size}
      >
        {labelType === "inside" && (
          <Text
            style={tws(
              "absolute left-1 top-1 text-base text-neutral-800",
              isToday ? "font-normal underline" : "font-light",
            )}
          >
            {day}
          </Text>
        )}
      </DayCellInner>
    </View>
  );
};

export default DayCellWrapper;
