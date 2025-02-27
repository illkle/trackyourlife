import { z } from "zod";

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

const zAlign = z.enum(["start", "end", "between"]).optional();

const zGroupBase = z.object({
  id: z.string(),
  type: z.literal("group"),
  align: zAlign,
});

// Define zGroup using a recursive approach compatible with discriminatedUnion
interface GroupItemType {
  id: string;
  type: "group";
  align?: z.infer<typeof zAlign>;
  items: (
    | z.infer<typeof zValue>
    | z.infer<typeof zAttribute>
    | z.infer<typeof zText>
    | z.infer<typeof zTime>
    | z.infer<typeof zSpacer>
    | GroupItemType
  )[];
}

// Create the schema using lazy and properly constructed discriminated union
const zGroup: z.ZodType<GroupItemType> = zGroupBase.extend({
  items: z.lazy(() =>
    z.array(z.union([zValue, zAttribute, zText, zTime, zSpacer, zGroup])),
  ),
});

export const zLogsDisplay = z.object({
  items: zGroup,
});

export type ILogsDisplay = z.infer<typeof zLogsDisplay>;
