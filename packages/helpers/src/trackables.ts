import { eachDayOfInterval, isSameDay, startOfTomorrow } from "date-fns";

import type { IBooleanSettings, INumberSettings } from "@tyl/db/jsonValidators";
import type { DbTrackableSelect } from "@tyl/db/schema";

import { range } from "./animation";
import { presetsMap } from "./colorPresets";
import { getColorAtPosition, makeColorString } from "./colorTools";

export interface DataRecord {
  readonly date: number;
  readonly value: string;
  readonly recordId: string;
  readonly createdAt: number | null;
}

export interface PureDataRecord {
  readonly date: Date;
  readonly value?: string;
  readonly disabled: boolean;
  readonly recordId?: string;
  readonly createdAt?: number | null;
}

/*
  This function convets database selection(which may miss some dates) to array of dates with values
*/
export const mapDataToRange = (
  start: number,
  end: number,
  data: readonly DataRecord[],
  orderBy: "asc" | "desc" = "asc",
): PureDataRecord[] => {
  const days = eachDayOfInterval({
    start,
    end,
  });

  if (orderBy === "desc") {
    days.reverse();
  }

  const disabledAfter = startOfTomorrow().getTime();
  const result = new Array(days.length) as PureDataRecord[];

  let dataPointer = 0;

  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    if (!day) continue;

    const disabled = day.getTime() >= disabledAfter;

    const dataRecord = data[dataPointer];
    if (dataRecord && isSameDay(day.getTime(), dataRecord.date)) {
      result[i] = {
        date: day,
        value: dataRecord.value,
        createdAt: dataRecord.createdAt,
        disabled,
        recordId: dataRecord.recordId,
      };
      dataPointer++;
    } else {
      result[i] = { date: day, disabled };
    }
  }

  return result;
};

export const getValueToColorFunc = (settings: INumberSettings) => {
  return (displayedNumber: number) => {
    if (
      !settings.colorCodingEnabled ||
      !settings.colorCoding ||
      displayedNumber === 0
    ) {
      return presetsMap.neutral;
    }
    return getColorAtPosition({
      value: settings.colorCoding,
      point: displayedNumber,
    });
  };
};

export const getValueToProgressPercentage = (settings: INumberSettings) => {
  return (val: number | undefined) => {
    const progress = settings.progress;
    if (
      !progress ||
      !settings.progressEnabled ||
      typeof progress.max === "undefined" ||
      typeof progress.min === "undefined" ||
      typeof val === "undefined"
    ) {
      return null;
    }
    return range(progress.min, progress.max, 0, 100, val);
  };
};

export const getDayCellBooleanColors = (settings: IBooleanSettings) => {
  const themeActive = settings.activeColor;
  const themeInactive = settings.inactiveColor;
  const themeActiveLight = makeColorString(
    themeActive?.lightMode ?? presetsMap.green.lightMode,
  );
  const themeActiveDark = makeColorString(
    themeActive?.darkMode ?? presetsMap.green.darkMode,
  );
  const themeInactiveLight = makeColorString(
    themeInactive?.lightMode ?? presetsMap.neutral.lightMode,
  );
  const themeInactiveDark = makeColorString(
    themeInactive?.darkMode ?? presetsMap.neutral.darkMode,
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
