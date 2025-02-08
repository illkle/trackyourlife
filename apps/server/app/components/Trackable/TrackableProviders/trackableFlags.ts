import { z } from "zod";

import {
  ZColorValue,
  ZNumberColorCoding,
  ZNumberProgressBounds,
} from "@tyl/db/jsonValidators";
import { presetsMap } from "@tyl/helpers/colorPresets";
import { makeColorStrings } from "@tyl/helpers/colorTools";
import {
  NumberColorCodingMapper,
  NumberProgressMapper,
  TagsValuesMapper,
} from "@tyl/helpers/trackables";

import type { ITrackableFlagsZero } from "~/schema";

/**
 * Flags that are stored in db and are accessed by trackable components.
 * Settings for trackables are stored here.
 *
 * To add add a new flag:
 * - Add it to FlagsValidators
 * - If it's a flag for any trackable, add it to ITrackableFlagKeyAny
 * - If it's a flag for specific type add it to corresponding ITrackableFlagKey(Boolean\Number\...)
 * - If it's a flag where each daycell will need result of same computation based on flag value(i.e Set lookup), add it as zod transform.
 */

export const LogsSavedAttributesValidator = z.object({
  key: z.string(),
  visibleName: z.string(),
  type: z.enum(["boolean", "number", "text"]),
});

export type ILogsSavedAttribute = z.infer<typeof LogsSavedAttributesValidator>;

export const FlagsValidators = {
  AnyTrackingStart: z.string().date().or(z.null()),
  AnyNote: z.string(),
  AnyMonthViewType: z.enum(["calendar", "list"]),

  BooleanCheckedColor: ZColorValue.transform(makeColorStrings),
  BooleanUncheckedColor: ZColorValue.transform(makeColorStrings),
  NumberProgessBounds: ZNumberProgressBounds.transform(
    (v) => new NumberProgressMapper(v),
  ),
  NumberColorCoding: ZNumberColorCoding.transform(
    (v) => new NumberColorCodingMapper(v),
  ),

  TagsValues: z.array(z.string()).transform((v) => new TagsValuesMapper(v)),

  LogsSavedAttributes: z.array(LogsSavedAttributesValidator),
};

/**
 * Default values for flags. Value from here is used when flag is not set in db.
 * Value is substituted when requested, not when mapping validators from db, hence not zod .default().
 */

export const FlagDefaultInputs: ITrackableFlagsInputKV = {
  AnyMonthViewType: "calendar",
  AnyNote: "",
  AnyTrackingStart: null,
  BooleanCheckedColor: presetsMap.green,
  BooleanUncheckedColor: presetsMap.neutral,
  NumberProgessBounds: {
    enabled: false,
  },
  NumberColorCoding: {
    enabled: false,
    colors: [],
  },
  TagsValues: [],
  LogsSavedAttributes: [],
};

const fullObject = z.object(FlagsValidators);

export const FlagDefaults: ITrackableFlagsKV =
  fullObject.parse(FlagDefaultInputs);

/**
 * Use this helper to get type of flag value accounting for default set.
 * `viewType: ITrackableFlagType<"AnyMonthViewType">;`
 */
export type ITrackableFlagType<K extends ITrackableFlagKey> =
  ITrackableFlagValue<K>;

export type ITrackableFlagKey = keyof typeof FlagsValidators;

export type ITrackableFlagValue<K extends ITrackableFlagKey> = z.infer<
  (typeof FlagsValidators)[K]
>;
export type ITrackableFlagValueInput<K extends ITrackableFlagKey> = z.input<
  (typeof FlagsValidators)[K]
>;

export type FlagSet = <K extends ITrackableFlagKey>(
  trackableId: string,
  key: K,
  value: ITrackableFlagValueInput<K>,
) => Promise<void>;

export type ITrackableFlagsKV = {
  [K in ITrackableFlagKey]: ITrackableFlagValue<K>;
};

export type ITrackableFlagsInputKV = {
  [K in ITrackableFlagKey]: ITrackableFlagValueInput<K>;
};

/*
  Helper for settings form
*/
export const createFlagsForSettingsForm = (
  flags: readonly ITrackableFlagsZero[],
) => {
  const object = {} as ITrackableFlagsInputKV;

  flags.forEach((flag) => {
    if (!(flag.key in FlagsValidators)) {
      return;
    }
    const validator = FlagsValidators[flag.key as ITrackableFlagKey];

    const parsed = validator.safeParse(flag.value);

    const key = flag.key as ITrackableFlagKey;
    if (parsed.success) {
      // @ts-expect-error this is fine
      object[key] = flag.value;
    } else {
      // @ts-expect-error this is fine
      object[key] = FlagDefaultInputs[key];
    }
  });

  return {
    ...FlagDefaultInputs,
    ...object,
  };
};
