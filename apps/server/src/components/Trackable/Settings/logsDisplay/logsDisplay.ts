import { z } from "zod/v4";

/** This is for testing purposes only ATM */
const zTextSettings = z.object({
  font: z.enum(["regular", "italic", "mono"]).optional(),
  opacity: z.number().min(0.2).max(1).optional(),
  size: z.enum(["s", "m", "l"]).optional(),
});

const zValue = z.object({
  id: z.string(),
  type: z.literal("value"),
  textSettings: zTextSettings.nullable(),
});

const zTime = z.object({
  id: z.string(),
  type: z.literal("time"),
  textSettings: zTextSettings.nullable(),
});

const zAttribute = z.object({
  id: z.string(),
  type: z.literal("attribute"),
  name: z.string().nullable(),
  textSettings: zTextSettings.nullable(),
});

const zText = z.object({
  id: z.string(),
  type: z.literal("text"),
  text: z.string().nullable(),
  textSettings: zTextSettings.nullable(),
});

const zSpacer = z.object({
  id: z.string(),
  type: z.literal("spacer"),
  width: z.number(),
});

const zDisplayItem = z.discriminatedUnion("type", [
  zValue,
  zAttribute,
  zText,
  zTime,
  zSpacer,
]);

const zDisplayItems = z.array(zDisplayItem);

export type IDisplayItem = z.infer<typeof zDisplayItem>;

export const zLogsDisplay = z.object({
  topLeft: zDisplayItems,
  topRight: zDisplayItems,
  middleLeft: zDisplayItems,
  middleRight: zDisplayItems,
  bottomLeft: zDisplayItems,
  bottomRight: zDisplayItems,
});

export type ILogsDisplay = z.infer<typeof zLogsDisplay>;
