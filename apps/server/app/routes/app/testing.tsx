import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GroupIcon, RectangleEllipsisIcon } from "lucide-react";
import { Reorder } from "motion/react";
import { v4 as uuidv4 } from "uuid";

import { Button } from "~/@shad/components/button";
import { Input } from "~/@shad/components/input";
import { cn } from "~/@shad/utils";

export const Route = createFileRoute("/app/testing")({
  component: RouteComponent,
});

function RouteComponent() {
  const [value, setValue] = useState<DisplayItem[]>([]);
  return (
    <div className="flex flex-col gap-4">
      <ViewCustomizer value={value} onChange={setValue} />
    </div>
  );
}

type SimpleItem =
  | {
      id: string;
      type: "value";
    }
  | {
      id: string;
      type: "attribute";
      name: string;
    }
  | {
      id: string;
      type: "text";
      text: string;
    }
  | {
      id: string;
      type: "spacer";
      width: number;
    };

interface GroupItem {
  id: string;
  type: "group";
  items: SimpleItem[];
}

type DisplayItem = SimpleItem | GroupItem;

const ViewCustomizer = ({
  value,
  onChange,
}: {
  value: DisplayItem[];
  onChange: (value: DisplayItem[]) => void;
}) => {
  const addThing = (v: DisplayItem) => {
    onChange([...value, v]);
  };

  const [focusedItemId, setFocusedItemId] = useState<DisplayItem["id"] | null>(
    null,
  );

  const focusedItem = value.find((v) => v.id === focusedItemId);
  const focusedItemIsGroup = focusedItem?.type === "group";

  const addToFocusedItem = (toAdd: SimpleItem) => {
    onChange(
      value.map((v) =>
        v.id === focusedItemId && v.type === "group"
          ? { ...v, items: [...v.items, toAdd] }
          : v,
      ),
    );
  };

  return (
    <div className="max-w-2xl">
      <ReorderEditor
        value={value}
        onChange={onChange}
        focusedItemId={focusedItemId}
        setFocusedItemId={setFocusedItemId}
        className="h-14 rounded-md border border-neutral-300 p-2 dark:border-neutral-700"
      />
      {focusedItemIsGroup ? (
        <SetOfButtons simple addThing={addToFocusedItem} />
      ) : (
        <SetOfButtons addThing={addThing} />
      )}
    </div>
  );
};

const ReorderEditor = <T extends DisplayItem | SimpleItem>({
  value,
  onChange,
  focusedItemId,
  setFocusedItemId,
  className,
}: {
  value: T[];
  onChange: (value: T[]) => void;
  focusedItemId?: T["id"] | null;
  setFocusedItemId?: (id: T["id"] | null) => void;
  className?: string;
}) => {
  return (
    <Reorder.Group values={value} axis="x" onReorder={onChange}>
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
        {value.map((v) => (
          <Reorder.Item
            key={v.id}
            value={v}
            className={cn(
              "relative flex items-center justify-center rounded-md",
              focusedItemId && focusedItemId !== v.id && "opacity-50",
              v.type === "group"
                ? "min-w-10 border-dashed"
                : "border border-neutral-200 px-2 py-1 dark:border-neutral-800",
            )}
          >
            <div
              onClick={() => setFocusedItemId?.(v.id)}
              className="flex h-full items-center justify-center gap-1 text-xs"
            >
              {v.type === "value" && (
                <>
                  <RectangleEllipsisIcon size={16} className="" />
                  <span>Value</span>
                </>
              )}
              {v.type === "attribute" && <>{v.name}</>}
              {v.type === "text" && <>{v.text}</>}
              {v.type === "spacer" && (
                <div style={{ width: `${v.width}` }}></div>
              )}

              {v.type === "group" && (
                <div className="flex items-center gap-1 rounded-sm border border-dashed border-neutral-400 dark:border-neutral-600">
                  <GroupIcon className="ml-2 shrink-0" size={16} />
                  <ReorderEditor
                    value={v.items}
                    onChange={(updateSubItems) => {
                      onChange(
                        value.map((item) =>
                          item.id === v.id
                            ? { ...item, items: updateSubItems }
                            : item,
                        ),
                      );
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

const SetOfButtons = ({
  addThing,
  simple,
}:
  | {
      addThing: (v: DisplayItem) => void;
      simple?: false;
    }
  | { addThing: (v: SimpleItem) => void; simple: true }) => {
  return (
    <div className="mt-5 flex flex-col gap-2">
      <Button onClick={() => addThing({ type: "value", id: uuidv4() })}>
        Add Value
      </Button>
      <SubInput
        onChange={(v) => addThing({ type: "attribute", name: v, id: uuidv4() })}
      >
        Add Attribute
      </SubInput>
      <SubInput
        onChange={(v) => addThing({ type: "text", text: v, id: uuidv4() })}
      >
        Add Text
      </SubInput>
      <SubInput
        onChange={(v) =>
          addThing({ type: "spacer", width: Number(v), id: uuidv4() })
        }
      >
        Add Spacer
      </SubInput>
      {!simple && (
        <Button
          onClick={() => addThing({ type: "group", items: [], id: uuidv4() })}
        >
          Add Group
        </Button>
      )}
    </div>
  );
};

const SubInput = ({
  onChange,
  children,
}: {
  onChange: (value: string) => void;
  children: string;
}) => {
  const [inputValue, setInputValue] = useState("value");
  return (
    <div className="flex gap-2">
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <Button onClick={() => onChange(inputValue)}>{children}</Button>
    </div>
  );
};
