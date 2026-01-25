import type { INumberColorCoding, INumberProgressBounds } from "@tyl/db/jsonValidators";

import { range } from "../animation";
import { presetsMap } from "../colorTools";
import { getColorAtPosition } from "../colorTools";

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
