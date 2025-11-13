import { createContext, useContext, useState } from "react";
import { useQuery } from "@rocicorp/zero/react";
import { cn } from "@shad/lib/utils";
import {
  ALargeSmallIcon,
  BracesIcon,
  ClockIcon,
  GroupIcon,
  ItalicIcon,
  PlusIcon,
  RectangleEllipsisIcon,
  RectangleHorizontalIcon,
  TextQuoteIcon,
  XIcon,
} from "lucide-react";
import { Reorder } from "motion/react";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod/v4";

import type { ITrackableRecordAttributeZero } from "@tyl/db/zero-schema";
import { mapUnorderedData } from "@tyl/helpers/trackables";

import { Button } from "~/@shad/components/button";
import { Input } from "~/@shad/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/@shad/components/select";
import { Slider } from "~/@shad/components/slider";
import { RadioTabItem, RadioTabs } from "~/@shad/custom/radio-tabs";
import { LogsItemsRendered } from "~/components/PopupEditor/LogsPopup";
import { useTrackableMeta } from "~/components/Trackable/TrackableProviders/TrackableProvider";
import { useZ } from "~/utils/useZ";

const zTextSettings = z.object({
  font: z.enum(["regular", "italic", "mono"]).optional(),
  opacity: z.number().min(0.2).max(1).optional(),
  size: z.enum(["s", "m", "l"]).optional(),
});

export type ITextSettings = z.infer<typeof zTextSettings>;

const TextSettingsInterface = ({
  value,
  onChange,
  className,
}: {
  value: ITextSettings | null;
  onChange: (value: ITextSettings | null) => void;
  className?: string;
}) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <RadioTabs
        value={value?.font ?? "regular"}
        onValueChange={(v) =>
          onChange({ ...value, font: v as ITextSettings["font"] })
        }
      >
        <RadioTabItem value="regular">
          <span className="flex items-center gap-2">
            <ALargeSmallIcon /> Regular
          </span>
        </RadioTabItem>
        <RadioTabItem value="italic">
          <span className="flex items-center gap-2">
            <ItalicIcon /> Italic
          </span>
        </RadioTabItem>
        <RadioTabItem value="mono">
          <span className="flex items-center gap-2">
            <BracesIcon /> Mono
          </span>
        </RadioTabItem>
      </RadioTabs>

      <Slider
        className="min-w-20"
        value={[value?.opacity ?? 1]}
        min={0.2}
        max={1}
        step={0.1}
        onValueChange={(v) => onChange({ ...value, opacity: v[0] })}
      />

      <RadioTabs
        value={value?.size ?? "l"}
        onValueChange={(v) =>
          onChange({ ...value, size: v as ITextSettings["size"] })
        }
      >
        <RadioTabItem value="s">S</RadioTabItem>
        <RadioTabItem value="m">M</RadioTabItem>
        <RadioTabItem value="l">L</RadioTabItem>
      </RadioTabs>
    </div>
  );
};

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

export type LogsDisplayItem =
  | z.infer<typeof zValue>
  | z.infer<typeof zAttribute>
  | z.infer<typeof zText>
  | z.infer<typeof zTime>
  | z.infer<typeof zSpacer>
  | (z.infer<typeof zGroupBase> & {
      items: LogsDisplayItem[];
    });

export const ZLogsDisplayItem: z.ZodType<LogsDisplayItem> = z.lazy(() =>
  z.discriminatedUnion("type", [
    zValue,
    zAttribute,
    zText,
    zTime,
    zSpacer,
    zGroupBase.extend({ items: z.array(ZLogsDisplayItem) }),
  ]),
);

export const zLogsDisplay = z.object({
  items: z.array(ZLogsDisplayItem),
  align: zAlign,
});

export type ILogsDisplay = z.infer<typeof zLogsDisplay>;

export const LogsDisplayPreview = ({
  displayValue,
}: {
  displayValue: ILogsDisplay;
}) => {
  const { id } = useTrackableMeta();
  const z = useZ();

  const [logs] = useQuery(
    z.query.TYL_trackableRecord.where("trackableId", "=", id)
      .limit(5)
      .related("trackableRecordAttributes"),
  );

  const mapped = mapUnorderedData(logs);

  return (
    <div className="flex min-h-10 flex-col justify-center">
      {mapped.length === 0 && (
        <div className="text-muted-foreground w-full text-center text-xs">
          Add some logs to this trackable to preview settings with your data
        </div>
      )}
      {mapped.map((v) => (
        <LogsItemsRendered key={v.recordId} value={v} items={displayValue} />
      ))}
    </div>
  );
};

export const LogsDisplayEditor = ({
  value,
  onChange,
  depth = 0,
}: {
  value: ILogsDisplay;
  onChange: (value: ILogsDisplay) => void;
  depth?: number;
}) => {
  const addThing = (v: LogsDisplayItem) => {
    onChange({ ...value, items: [...value.items, v] });
    setFocusedItemId(v.id);
  };

  const updateItem = (update: LogsDisplayItem) => {
    onChange({
      ...value,
      items: value.items.map((v) => (v.id === update.id ? update : v)),
    });
  };

  const [focusedItemId, setFocusedItemId] = useState<
    LogsDisplayItem["id"] | null
  >(null);

  const focusedItem = value.items.find((v) => v.id === focusedItemId);
  const focusedItemIsGroup = focusedItem?.type === "group";

  const setItems = (toAdd: LogsDisplayItem[]) => {
    onChange({
      ...value,
      items: value.items.map((v) =>
        v.id === focusedItemId ? { ...v, items: toAdd } : v,
      ),
    });
  };

  const deleteItem = (id: LogsDisplayItem["id"]) => {
    onChange({
      ...value,
      items: value.items.filter((v) => v.id !== id),
    });
  };

  return (
    <div className="max-w-2xl">
      <ReorderEditor
        value={value}
        onChange={onChange}
        focusedItemId={focusedItemId}
        setFocusedItemId={setFocusedItemId}
        onDeleted={deleteItem}
        className="border-border h-14 rounded-md border p-2"
      />

      {focusedItemIsGroup ? (
        <div className="mt-2 px-2">
          <LogsDisplayEditor
            value={focusedItem}
            onChange={(v) => setItems(v.items)}
            depth={depth + 1}
          />
        </div>
      ) : (
        <>
          {focusedItem && (
            <ItemEditor value={focusedItem} onChange={updateItem} />
          )}
          <CreateButtons addThing={addThing} depth={depth} />
        </>
      )}
    </div>
  );
};

const CreateButtons = ({
  addThing,
  depth,
}: {
  addThing: (v: LogsDisplayItem) => void;
  depth: number;
}) => {
  return (
    <div className="mt-5 flex gap-2">
      <Button
        variant={"outline"}
        onClick={() =>
          addThing({ type: "value", id: uuidv4(), textSettings: null })
        }
      >
        <PlusIcon size={16} />
        Value
      </Button>
      <Button
        variant={"outline"}
        onClick={() =>
          addThing({ type: "time", id: uuidv4(), textSettings: null })
        }
      >
        <PlusIcon size={16} />
        Time
      </Button>
      <Button
        variant={"outline"}
        onClick={() =>
          addThing({
            type: "attribute",
            name: null,
            id: uuidv4(),
            textSettings: null,
          })
        }
      >
        <PlusIcon size={16} />
        Attribute
      </Button>
      <Button
        variant={"outline"}
        onClick={() =>
          addThing({
            type: "text",
            text: null,
            id: uuidv4(),
            textSettings: null,
          })
        }
      >
        <PlusIcon size={16} />
        Text
      </Button>
      <Button
        variant={"outline"}
        onClick={() =>
          addThing({
            type: "spacer",
            width: 10,
            id: uuidv4(),
          })
        }
      >
        <PlusIcon size={16} />
        Spacer
      </Button>
      {depth < 1 && (
        <Button
          variant={"outline"}
          onClick={() =>
            addThing({
              type: "group",
              items: [],
              align: "start",
              id: uuidv4(),
            })
          }
        >
          <PlusIcon size={16} />
          Group
        </Button>
      )}
    </div>
  );
};
const ItemEditor = ({
  value,
  onChange,
}: {
  value: LogsDisplayItem;
  onChange: (value: LogsDisplayItem) => void;
}) => {
  return (
    <div className="border-border mt-2 flex flex-col gap-2 rounded-sm border p-2 px-2">
      <div className="capitalize">{value.type}</div>
      <div>
        {value.type === "value" && (
          <>
            <TextSettingsInterface
              value={value.textSettings}
              onChange={(v) => onChange({ ...value, textSettings: v })}
            />
          </>
        )}
        {value.type === "spacer" && <>Nothing to condifgure for type</>}
        {value.type === "attribute" && (
          <>
            <AttributeSelector
              value={value.name}
              onChange={(upd) => onChange({ ...value, name: upd })}
            />
            <TextSettingsInterface
              className="mt-2"
              value={value.textSettings}
              onChange={(v) => onChange({ ...value, textSettings: v })}
            />
          </>
        )}
        {value.type === "text" && (
          <>
            <Input
              value={value.text ?? ""}
              onChange={(e) => onChange({ ...value, text: e.target.value })}
            />
            <TextSettingsInterface
              value={value.textSettings}
              onChange={(v) => onChange({ ...value, textSettings: v })}
            />
          </>
        )}
        {value.type === "time" && (
          <>
            <TextSettingsInterface
              value={value.textSettings}
              onChange={(v) => onChange({ ...value, textSettings: v })}
            />
          </>
        )}
      </div>
    </div>
  );
};

const ReorderEditor = ({
  value,
  onChange,
  focusedItemId,
  setFocusedItemId,
  className,
  onDeleted,
}: {
  value: ILogsDisplay;
  onChange: (value: ILogsDisplay) => void;
  focusedItemId?: LogsDisplayItem["id"] | null;
  setFocusedItemId?: (id: LogsDisplayItem["id"] | null) => void;
  className?: string;
  onDeleted?: (id: LogsDisplayItem["id"]) => void;
}) => {
  return (
    <Reorder.Group
      values={value.items}
      axis="x"
      onReorder={(items) => onChange({ ...value, items })}
    >
      <div
        className={cn(
          "relative flex w-full items-stretch justify-between gap-2 overflow-hidden",
          className,
        )}
        onClick={(e) => {
          if (e.currentTarget !== e.target) return;
          setFocusedItemId?.(null);
        }}
      >
        {value.items.map((v) => (
          <Reorder.Item
            key={v.id}
            value={v}
            className={cn(
              "relative flex items-center justify-center rounded-md",
              focusedItemId && focusedItemId !== v.id && "opacity-50",
              v.type === "group"
                ? "min-w-10 border-dashed"
                : "border-border border px-2 py-1",
            )}
          >
            <div
              onClick={() => setFocusedItemId?.(v.id)}
              className="flex h-full items-center justify-center gap-1 text-xs"
            >
              {onDeleted && (
                <Button
                  variant={"ghost"}
                  className="absolute top-0 right-0 h-4 w-4 translate-x-1/2 -translate-y-1/2 rounded-full p-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleted(v.id);
                  }}
                >
                  <XIcon size={12} className="cursor-pointer" />
                </Button>
              )}
              {v.type === "value" && (
                <>
                  <RectangleEllipsisIcon size={16} className="" />
                  <span>Value</span>
                </>
              )}
              {v.type === "attribute" && (
                <>
                  <RectangleHorizontalIcon size={16} className="" />
                  <span>{v.name ?? "—"}</span>
                </>
              )}
              {v.type === "text" && (
                <>
                  <TextQuoteIcon size={16} />
                  {v.text}
                </>
              )}
              {v.type === "spacer" && (
                <div style={{ width: `${v.width}` }}></div>
              )}
              {v.type === "time" && (
                <>
                  <ClockIcon size={16} />
                </>
              )}

              {v.type === "group" && (
                <div className="border-border flex items-center gap-1 rounded-sm border border-dashed">
                  <GroupIcon className="ml-2 shrink-0" size={16} />
                  <ReorderEditor
                    value={v}
                    onChange={(updateSubItems) => {
                      onChange({
                        ...value,
                        items: value.items.map((item) =>
                          item.id === v.id
                            ? { ...item, items: updateSubItems.items }
                            : item,
                        ),
                      });
                    }}
                    className="h-10 min-w-10 px-3 py-1"
                    focusedItemId={null}
                  />
                </div>
              )}
            </div>
          </Reorder.Item>
        ))}
      </div>
    </Reorder.Group>
  );
};

const AttributeSelector = ({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) => {
  const { attributes } = useContext(AwailableAttributesContext);
  return (
    <Select value={value ?? undefined} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select Attribute" />
      </SelectTrigger>
      <SelectContent>
        {attributes.map((a) => (
          <SelectItem key={a.key} value={a.key}>
            {a.key}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export const AwailableAttributesContext = createContext<{
  attributes: { key: string; type: ITrackableRecordAttributeZero["type"] }[];
}>({
  attributes: [],
});
