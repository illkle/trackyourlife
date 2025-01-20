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

export const ZColorCodingValue = z.object({
  point: z.number(),
  color: ZColorValue,
  // used to key inputs when editing, can be changed voluntarily
  id: z.string().uuid().default("empty_id"),
});

export const ZNumberColorCoding = z.object({
  enabled: z.boolean().optional(),
  colors: z.array(ZColorCodingValue).optional().default([]),
});

/* Other stuff */

export const ZNumberProgressBounds = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  enabled: z.boolean().optional(),
});

export type IColorRGB = z.infer<typeof colorRGB>;
export type IColorHSL = z.infer<typeof colorHSL>;
export type IColorValue = z.infer<typeof ZColorValue>;

export type IColorCodingValue = z.infer<typeof ZColorCodingValue>;

export type INumberProgressBounds = z.infer<typeof ZNumberProgressBounds>;
export type INumberColorCoding = z.infer<typeof ZNumberColorCoding>;
