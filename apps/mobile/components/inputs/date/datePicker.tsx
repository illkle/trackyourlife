import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { format } from "date-fns";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react-native";

import {
  getDatePickerMonthData,
  getDefaultDatePickerLimits,
  getInitialDatePickerCursor,
  isCursorAtLimitMonth,
  isDateWithinLimits,
  moveDatePickerCursorByMonths,
  type DatePickerLimits,
} from "@tyl/helpers/date/datePicker";

import { cn, useIconColor } from "@/lib/utils";

const weekdayNames = ["M", "T", "W", "T", "F", "S", "S"];

export const DatePicker = ({
  value,
  onChange,
  limits,
  onPick,
}: {
  value?: Date;
  onChange: (nextValue?: Date) => void;
  limits?: DatePickerLimits;
  onPick?: () => void;
}) => {
  const dateNow = new Date();
  const resolvedLimits = limits ?? getDefaultDatePickerLimits();

  const [cursor, setCursor] = useState(() => getInitialDatePickerCursor(value, dateNow));

  const iconColor = useIconColor();

  const { dates, prepend } = useMemo(() => getDatePickerMonthData(cursor), [cursor]);

  const selectedDay = useMemo(() => {
    if (!value) {
      return -1;
    }

    const sameMonth =
      value.getFullYear() === cursor.getFullYear() && value.getMonth() === cursor.getMonth();
    return sameMonth ? value.getDate() : -1;
  }, [cursor, value]);

  const maxMonth = dateNow.getTime() < resolvedLimits.end.getTime() ? dateNow : resolvedLimits.end;

  const canMoveBack = !isCursorAtLimitMonth(cursor, resolvedLimits.start);
  const canMoveForward = !isCursorAtLimitMonth(cursor, maxMonth);

  const moveCursor = (monthDelta: number) => {
    setCursor((current) => moveDatePickerCursorByMonths(current, monthDelta, resolvedLimits));
  };

  const selectDay = (day: number) => {
    const nextDate = new Date(cursor.getFullYear(), cursor.getMonth(), day);
    if (!isDateWithinLimits(nextDate, resolvedLimits)) {
      return;
    }

    onChange(nextDate);
    onPick?.();
  };

  return (
    <View className="self-center">
      <View className="mb-3 flex-row items-center justify-between gap-1">
        <View className="flex-row">
          <Pressable
            className={cn(
              "h-9 w-9 items-center justify-center rounded-md",
              !canMoveBack && "opacity-40",
            )}
            onPress={() => moveCursor(-12)}
            disabled={!canMoveBack}
          >
            <ChevronsLeftIcon size={16} color={iconColor} />
          </Pressable>
          <Pressable
            className={cn(
              "h-9 w-9 items-center justify-center rounded-md",
              !canMoveBack && "opacity-40",
            )}
            onPress={() => moveCursor(-1)}
            disabled={!canMoveBack}
          >
            <ChevronLeftIcon size={16} color={iconColor} />
          </Pressable>
        </View>

        <Text className="min-w-34 text-center text-sm font-semibold text-foreground">
          {format(cursor, "MMMM yyyy")}
        </Text>

        <View className="flex-row">
          <Pressable
            className={cn(
              "h-9 w-9 items-center justify-center rounded-md",
              !canMoveForward && "opacity-40",
            )}
            onPress={() => moveCursor(1)}
            disabled={!canMoveForward}
          >
            <ChevronRightIcon size={16} color={iconColor} />
          </Pressable>
          <Pressable
            className={cn(
              "h-9 w-9 items-center justify-center rounded-md",
              !canMoveForward && "opacity-40",
            )}
            onPress={() => moveCursor(12)}
            disabled={!canMoveForward}
          >
            <ChevronsRightIcon size={16} color={iconColor} />
          </Pressable>
        </View>
      </View>

      <View className="mb-1 flex-row gap-1">
        {weekdayNames.map((weekday, index) => (
          <View key={`${weekday}-${index}`} className="h-5 w-9 items-center justify-center">
            <Text className="text-xs text-muted-foreground">{weekday}</Text>
          </View>
        ))}
      </View>

      <View className="w-fit flex-row flex-wrap gap-1">
        {prepend.map((_, index) => (
          <View key={`prepend-${index}`} className="h-9 w-9" />
        ))}

        {dates.map((day) => {
          const dayDate = new Date(cursor.getFullYear(), cursor.getMonth(), day);
          const inLimit = isDateWithinLimits(dayDate, resolvedLimits);
          const isSelected = day === selectedDay;

          return (
            <Pressable
              key={`${cursor.getMonth()}-${day}`}
              className={cn(
                "h-9 w-9 items-center justify-center rounded-md border border-transparent",
                isSelected && "border-primary bg-primary",
                !isSelected && inLimit && "active:bg-accent",
                !inLimit && "opacity-35",
              )}
              disabled={!inLimit}
              onPress={() => selectDay(day)}
            >
              <Text
                className={cn(
                  "text-sm text-foreground",
                  isSelected && "font-semibold text-primary-foreground",
                )}
              >
                {day}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
