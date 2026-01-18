import { eachDayOfInterval, isBefore, isSameDay, startOfTomorrow } from "date-fns";

import type { INumberColorCoding, INumberProgressBounds } from "@tyl/db/jsonValidators";

import { range } from "./animation";
import { presetsMap } from "./colorPresets";
import { getColorAtPosition } from "./colorTools";

// Comes from db
export interface DataRecord {
  readonly timestamp: number;
  readonly value: string;
  readonly id: string;
  readonly updated_at: number | null;
}

export interface PureDataRecord {
  readonly timestamp: Date;
  readonly values: RecordValue[];
  readonly disabled: boolean;
}

export interface RecordValue {
  readonly recordId: string;
  /** Will never actually be undefined, but this makes for simpler inherited types in daycell */
  readonly value?: string;
  readonly timestamp: number;
  readonly updatedAt: number | null;
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

  if (first && last && first.timestamp > last.timestamp) {
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
      timestamp: day,
      disabled,
      values: [],
    };

    while (true) {
      if (disabled) break;

      const dataRecord = data[dataPointer];
      if (!dataRecord) break;

      if (!isSameDay(day, dataRecord.timestamp)) {
        if (isBefore(dataRecord.timestamp, day.getTime())) {
          dataPointer++;
          continue;
        }

        break;
      }

      dayRecord.values.push({
        value: dataRecord.value,
        timestamp: dataRecord.timestamp,
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

export class NumberColorCodingMapper {
  colorCoding?: INumberColorCoding;
  constructor(colorCoding: INumberColorCoding) {
    this.colorCoding = colorCoding;
  }

  valueToColor(displayedNumber: number) {
    if (!this.colorCoding?.enabled || !this.colorCoding.colors?.length || displayedNumber === 0) {
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
