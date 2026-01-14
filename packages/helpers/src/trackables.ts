import {
  eachDayOfInterval,
  isBefore,
  isSameDay,
  startOfTomorrow,
} from "date-fns";

import type {
  INumberColorCoding,
  INumberProgressBounds,
} from "@tyl/db/jsonValidators";
import type { DbTrackableSelect } from "@tyl/db/schema";

import { range } from "./animation";
import { presetsMap } from "./colorPresets";
import { getColorAtPosition } from "./colorTools";

// Comes from db
export interface DataRecord {
  readonly date: number;
  readonly value: string;
  readonly id: string;
  readonly created_at: number | null;
  readonly updated_at: number | null;
}

export interface PureDataRecord {
  readonly date: Date;
  readonly values: RecordValue[];
  readonly disabled: boolean;
}

export interface RecordValue {
  readonly recordId: string;
  /** Will never actually be undefined, but this makes for simpler inherited types in daycell */
  readonly value?: string;
  readonly createdAt: number | null;
  readonly updatedAt: number | null;
  readonly timestamp: number;
}

/**
 * @param start Date or date.getTime() of first day. this day is included. time is ignored
 * @param end Date or date.getTime() of last day. this day is included. time is ignored
 * @param data data from db. must be in ascending order by datetime.
 * @param orderBy by default asc, set to desc if you to output days in reverse
 * @returns array of DataRecord's. Each record is a day.
 */
export const mapDataToRange = (
  start: number | Date,
  end: number | Date,
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
  const result: PureDataRecord[] = [];

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

      /**
       * We store dates in UTC, but zero reads them and assumes local timesone
       */
      const recordDateInCorrectTimezone = convertDateFromDbToLocal(
        dataRecord.date,
      );

      if (!isSameDay(day, recordDateInCorrectTimezone)) {
        if (isBefore(dataRecord.date, day.getTime())) {
          dataPointer++;
          continue;
        }

        break;
      }

      dayRecord.values.push({
        value: dataRecord.value,
        timestamp: convertDateFromDbToLocal(dataRecord.date).getTime(),
        createdAt: dataRecord.created_at,
        updatedAt: dataRecord.updated_at,
        recordId: dataRecord.id,
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

export const convertDateFromDbToLocal = (date: number | Date) => {
  const d = typeof date === "number" ? new Date(date) : date;
  return new Date(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds(),
  );
};

export const convertDateFromLocalToDb = (date: Date) => {
  return Number(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
    ),
  );
};

export class NumberColorCodingMapper {
  colorCoding?: INumberColorCoding;
  constructor(colorCoding: INumberColorCoding) {
    this.colorCoding = colorCoding;
  }

  valueToColor(displayedNumber: number) {
    if (
      !this.colorCoding?.enabled ||
      !this.colorCoding.colors?.length ||
      displayedNumber === 0
    ) {
      return presetsMap.neutral;
    }
    return getColorAtPosition({
      value: this.colorCoding.colors,
      point: displayedNumber,
    });
  }
}

export class NumberProgressMapper {
  progress?: INumberProgressBounds;
  constructor(progress?: INumberProgressBounds) {
    this.progress = progress;
  }

  map(val: number | undefined) {
    if (
      !this.progress?.enabled ||
      typeof this.progress.max === "undefined" ||
      typeof this.progress.min === "undefined" ||
      typeof val === "undefined"
    ) {
      return null;
    }
    return range(this.progress.min, this.progress.max, 0, 100, val);
  }
}

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
