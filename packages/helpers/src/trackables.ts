import {
  eachDayOfInterval,
  isBefore,
  isSameDay,
  startOfTomorrow,
} from "date-fns";
import fuzzysort from "fuzzysort";

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
  readonly recordId: string;
  readonly createdAt: number | null;
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

export class TagsValuesMapper {
  values: Set<string>;
  prepared: Fuzzysort.Prepared[];

  constructor(values: string[]) {
    this.values = new Set(values);
    this.prepared = values.map((v) => fuzzysort.prepare(v));
  }

  getSuggestions(value: string) {
    return fuzzysort
      .go(value, this.prepared, {
        threshold: 0.3,
        all: true,
      })
      .map((v) => v.target);
  }

  addAndReturnArray(value: string) {
    if (this.values.has(value)) return Array.from(this.values);
    return [...Array.from(this.values), value];
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
