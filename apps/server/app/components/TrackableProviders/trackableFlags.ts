import { z } from "zod";

import {
  ZColorValue,
  ZNumberColorCoding,
  ZNumberProgressBounds,
} from "@tyl/db/jsonValidators";

/*
  Flags that are stored in db and are accessed by trackable components.
  Settings for trackable goes here.

  To add add a new flag:
  - Add it to FlagsValidators
  - If it's a flag for any trackable, add it to ITrackableFlagKeyAny
  - If it's a flag for specific type add it to corresponding ITrackableFlagKey(Boolean\Number\...)
*/

export const FlagsValidators = {
  BooleanCheckedColor: ZColorValue,
  BooleanUncheckedColor: ZColorValue,
  NumberProgessBounds: ZNumberProgressBounds,
  NumberColorCoding: ZNumberColorCoding,

  AnyTrackingStart: z.string().date(),
  AnyNote: z.string(),
  AnyMonthViewType: z.enum(["calendar", "list"]).default("calendar"),
};

export type ITrackableFlagKey = keyof typeof FlagsValidators;

type ITrackableFlagKeyAny = keyof Pick<
  typeof FlagsValidators,
  "AnyMonthViewType" | "AnyNote"
>;

export type ITrackableFlagKeyBoolean = keyof Pick<
  typeof FlagsValidators,
  "BooleanCheckedColor" | "BooleanUncheckedColor" | ITrackableFlagKeyAny
>;
