import { z } from "zod";

/* Colors */

export const colorRGB = z.object({
  r: z.number().min(0).max(255).default(0),
  g: z.number().min(0).max(255).default(0),
  b: z.number().min(0).max(255).default(0),
});

export const colorHSL = z.object({
  h: z.number().min(0).max(360).default(0),
  s: z.number().min(0).max(100).default(0),
  l: z.number().min(0).max(100).default(0),
});

export const ZColorValue = z.object({
  lightMode: colorHSL,
  darkMode: colorHSL,
  userSelect: colorHSL,
  manualMode: z.boolean().optional(),
});

export type IColorRGB = z.infer<typeof colorRGB>;
export type IColorHSL = z.infer<typeof colorHSL>;
export type IColorValue = z.infer<typeof ZColorValue>;

/* Trackable settings */

const basics = {
  startDate: z.string().datetime().optional(),
};

export const ZTrackableSettingsBase = z.object(basics);

export const ZTrackableSettingsBoolean = z.object({
  ...basics,
  inactiveColor: ZColorValue.optional(),
  activeColor: ZColorValue.optional(),
});

export const ZColorCodingValue = z.object({
  point: z.number(),
  color: ZColorValue,
  // used to key inputs when editing, can be changed voluntarily
  id: z.string().uuid().default("empty_id"),
});

export type IColorCodingValue = z.infer<typeof ZColorCodingValue>;

export const ZTrackableSettingsNumber = z.object({
  ...basics,
  incrementBy: z.number().min(1).optional(),
  progressEnabled: z.boolean().optional(),
  progress: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
  colorCodingEnabled: z.boolean().optional(),
  colorCoding: z.array(ZColorCodingValue).optional(),
});

const typeSettingsUnion = z.discriminatedUnion("type", [
  z.object({ type: z.literal("boolean"), settings: ZTrackableSettingsBoolean }),
  z.object({ type: z.literal("number"), settings: ZTrackableSettingsNumber }),
]);

export const ZTrackableSettings = typeSettingsUnion.transform(
  (v) => v.settings,
);

export type IBooleanSettings = z.infer<typeof ZTrackableSettingsBoolean>;
export type INumberSettings = z.infer<typeof ZTrackableSettingsNumber>;

export type ITrackableSettings = IBooleanSettings | INumberSettings;

/* User settings */

export const ZUserSettings = z.object({
  favorites: z.array(z.string()).default([]),
  colorPresets: z.array(ZColorValue).optional(),
  preserveLocationOnSidebarNav: z.boolean().default(true),
  timezone: z
    .object({
      name: z.string(),
      label: z.string(),
      tzCode: z.string(),
      utc: z.string(),
    })
    .optional(),
});

export type IUserSettings = z.infer<typeof ZUserSettings>;
