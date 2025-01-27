import {
  eachDayOfInterval,
  isBefore,
  isSameDay,
  startOfTomorrow,
} from "date-fns";

import type {
  IColorValue,
  INumberColorCoding,
  INumberProgressBounds,
} from "@tyl/db/jsonValidators";
import type { DbTrackableSelect } from "@tyl/db/schema";

import { range } from "./animation";
import { presetsMap } from "./colorPresets";
import { getColorAtPosition, makeColorString } from "./colorTools";

// Comes from db
export interface DataRecord {
  readonly date: number;
  readonly value: string;
  readonly recordId: string;
  readonly createdAt: number | null;
}

export interface PureDataRecord {
  readonly date: Date;
  readonly values: RecordValue[];
  readonly disabled: boolean;
}

interface RecordValue {
  readonly recordId: string;
  /** Will never actually be undefined, but this makes for simpler inherited types in daycell */
  readonly value?: string;
  readonly createdAt: number | null;
}

/**
 * Takes a data queired from db over a certain range and maps it to array of `PureDataRecord` where each record is day in range `start`->`end`(including both).
 * Data MUST be in ascending order.
 */
export const mapDataToRange = (
  start: number,
  end: number,
  data: readonly DataRecord[],
  orderBy: "asc" | "desc" = "asc",
): PureDataRecord[] => {
  if (start > end) {
    throw new Error("Error in mapDataToRange: end is before start");
  }

  const first = data[0];
  const last = data[data.length - 1];

  if (first && last && first.date > last.date) {
    throw new Error("Error in mapDataToRange: data must be in ascending order");
  }

  const days = eachDayOfInterval({
    start,
    end,
  });

  const disabledAfter = startOfTomorrow().getTime();
  const result = new Array(days.length) as PureDataRecord[];

  let dataPointer = 0;

  for (const day of days) {
    const disabled = day.getTime() >= disabledAfter;

    const dayRecord: PureDataRecord = {
      date: day,
      disabled,
      values: [],
    };

    while (true) {
      if (disabled) break;

      const dataRecord = data[dataPointer];
      if (!dataRecord) break;

      if (isBefore(dataRecord.date, day.getTime())) {
        dataPointer++;
        continue;
      }

      if (!isSameDay(day.getTime(), dataRecord.date)) {
        break;
      }

      dayRecord.values.push({
        value: dataRecord.value,
        createdAt: dataRecord.createdAt,
        recordId: dataRecord.recordId,
      });
      dataPointer++;
    }

    result.push(dayRecord);
  }

  if (orderBy === "desc") {
    result.reverse();
  }

  return result;
};

export const getValueToColorFunc = (colorCoding?: INumberColorCoding) => {
  return (displayedNumber: number) => {
    if (
      !colorCoding?.enabled ||
      !colorCoding.colors.length ||
      displayedNumber === 0
    ) {
      return presetsMap.neutral;
    }
    return getColorAtPosition({
      value: colorCoding.colors,
      point: displayedNumber,
    });
  };
};

export const getValueToProgressPercentage = (
  progress?: INumberProgressBounds,
) => {
  return (val: number | undefined) => {
    if (
      !progress?.enabled ||
      typeof progress.max === "undefined" ||
      typeof progress.min === "undefined" ||
      typeof val === "undefined"
    ) {
      return null;
    }
    return range(progress.min, progress.max, 0, 100, val);
  };
};

export const getDayCellBooleanColors = (
  activeColor?: IColorValue,
  inactiveColor?: IColorValue,
) => {
  const themeActiveLight = makeColorString(
    activeColor?.lightMode ?? presetsMap.green.lightMode,
  );
  const themeActiveDark = makeColorString(
    activeColor?.darkMode ?? presetsMap.green.darkMode,
  );
  const themeInactiveLight = makeColorString(
    inactiveColor?.lightMode ?? presetsMap.neutral.lightMode,
  );
  const themeInactiveDark = makeColorString(
    inactiveColor?.darkMode ?? presetsMap.neutral.darkMode,
  );

  return {
    themeActiveDark,
    themeActiveLight,
    themeInactiveDark,
    themeInactiveLight,
  };
};

interface Group {
  readonly group: string;
}
type GroupArray = readonly Group[];

export const sortTrackableList = <
  T extends Pick<DbTrackableSelect, "id" | "name"> & {
    readonly trackableGroup: GroupArray;
  },
>(
  list: T[],
) => {
  const newList = list.sort((a, b) => {
    if (
      a.trackableGroup.some((v) => v.group === "favorites") &&
      !b.trackableGroup.some((v) => v.group === "favorites")
    )
      return -1;
    if (
      !a.trackableGroup.some((v) => v.group === "favorites") &&
      b.trackableGroup.some((v) => v.group === "favorites")
    )
      return 1;

    const aName = a.name || "";
    const bName = b.name || "";

    return aName.localeCompare(bName);
  });

  return newList;
};
