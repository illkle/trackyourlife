import { z } from "zod";

import {
  ZColorValue,
  ZNumberColorCoding,
  ZNumberProgressBounds,
} from "@tyl/db/jsonValidators";
import { presetsMap } from "@tyl/helpers/colorPresets";

/**
 * Flags that are stored in db and are accessed by trackable components.
 * Settings for trackable goes here.
 *
 * To add add a new flag:
 * - Add it to FlagsValidators
 * - If it's a flag for any trackable, add it to ITrackableFlagKeyAny
 * - If it's a flag for specific type add it to corresponding ITrackableFlagKey(Boolean\Number\...)
 */
export const FlagsValidators = {
  AnyTrackingStart: z.string().date().or(z.undefined()),
  AnyNote: z.string(),
  AnyMonthViewType: z.enum(["calendar", "list"]).default("calendar"),

  BooleanCheckedColor: ZColorValue,
  BooleanUncheckedColor: ZColorValue,
  NumberProgessBounds: ZNumberProgressBounds,
  NumberColorCoding: ZNumberColorCoding,
};

/**
 * Default values for flags. Value from here is used when flag is not set in db.
 */
export const FlagDefaults: ITrackableFlags = {
  AnyMonthViewType: "calendar",
  AnyNote: "",
  AnyTrackingStart: undefined,

  BooleanCheckedColor: presetsMap.green,
  BooleanUncheckedColor: presetsMap.neutral,

  NumberProgessBounds: {
    enabled: false,
  },
  NumberColorCoding: {
    enabled: false,
    colors: [],
  },
};

/**
 * Use this helper to get type of flag value accounting for default set.
 * `viewType: ITrackableFlagType<"AnyMonthViewType">;`
 */
export type ITrackableFlagType<K extends ITrackableFlagKey> =
  ITrackableFlagValue<K>;

const _i = z.object({ ...FlagsValidators });

type ITrackableFlags = z.infer<typeof _i>;

export type ITrackableFlagKey = keyof typeof FlagsValidators;

export type ITrackableFlagValue<K extends ITrackableFlagKey> = z.infer<
  (typeof FlagsValidators)[K]
>;

export type ITrackableFlagsKV = {
  [K in ITrackableFlagKey]: ITrackableFlagValue<K>;
};
