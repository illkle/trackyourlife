import type { IColorCodingValue } from "@tyl/db/jsonValidators";

import { cloneDeep } from "lodash-es";

import { clamp } from "../animation";

export const getActualMin = (firstVal: number | undefined, minInput: number | null) => {
  if (typeof firstVal !== "number" && typeof minInput !== "number") return 0;

  const a = typeof firstVal === "number" ? firstVal : Number.POSITIVE_INFINITY;
  const b = typeof minInput === "number" ? minInput : Number.POSITIVE_INFINITY;
  return Math.min(a, b);
};

export const getActualMax = (firstVal: number | undefined, maxInput: number | null) => {
  if (typeof firstVal !== "number" && typeof maxInput !== "number") return 100;

  const a = typeof firstVal === "number" ? firstVal : Number.NEGATIVE_INFINITY;
  const b = typeof maxInput === "number" ? maxInput : Number.NEGATIVE_INFINITY;
  return Math.max(a, b);
};

export const clampPointsToRange = ({
  value,
  min,
  max,
}: {
  value: IColorCodingValue[];
  min: number;
  max: number;
}) => {
  return value.map((v) => ({ ...v, point: clamp(v.point, min, max) }));
};

export const cloneAndSortColorCoding = (value: IColorCodingValue[]): IColorCodingValue[] => {
  return cloneDeep(value).sort((a, b) => a.point - b.point);
};
