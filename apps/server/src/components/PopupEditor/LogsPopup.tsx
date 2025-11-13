import { useId, useState } from "react";
import { cn } from "@shad/lib/utils";
import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { CornerRightUp, XIcon } from "lucide-react";

import type { RecordValue } from "@tyl/helpers/trackables";

import type { PopupEditorProps } from "~/components/PopupEditor";
import type { ITextSettings } from "~/components/Trackable/Settings/logsDisplayEditor";
import type { ITrackableFlagValue } from "~/components/Trackable/TrackableProviders/trackableFlags";
import { Button } from "~/@shad/components/button";
import { Input } from "~/@shad/components/input";
import { Label } from "~/@shad/components/label";
import { ScrollArea, ScrollBar } from "~/@shad/components/scroll-area";
import { useTrackableFlag } from "~/components/Trackable/TrackableProviders/TrackableFlagsProvider";
import { useTrackableMeta } from "~/components/Trackable/TrackableProviders/TrackableProvider";

export const LogsTextRenderer = ({
  textSettings,
  children,
}: {
  textSettings: ITextSettings | null;
  children: React.ReactNode;
}) => {
  return (
    <span
      className={cn(
        "text-xs",
        textSettings?.size === "s" && "text-xs",
        textSettings?.size === "m" && "text-sm",
        textSettings?.size === "l" && "text-base",
        textSettings?.font === "mono" && "font-mono",
        textSettings?.font === "italic" && "italic",
      )}
      style={{
        opacity: textSettings?.opacity,
      }}
    >
      {children}
    </span>
  );
};

export const LogsItemRenderer = ({
  value,
  cell,
}: {
  value: RecordValue;
  cell: ITrackableFlagValue<"LogsDisplay">["items"][0];
}) => {
  switch (cell.type) {
    case "time":
      return (
        <LogsTextRenderer textSettings={cell.textSettings}>
          {format(value.timestamp, "HH:mm:ss")}
        </LogsTextRenderer>
      );
    case "value":
      return (
        <LogsTextRenderer textSettings={cell.textSettings}>
          {value.value}
        </LogsTextRenderer>
      );
    case "attribute":
      return cell.name ? (
        <LogsTextRenderer textSettings={cell.textSettings}>
          {value.attributes[cell.name]}
        </LogsTextRenderer>
      ) : null;
    case "text":
      return (
        <LogsTextRenderer textSettings={cell.textSettings}>
          {cell.text}
        </LogsTextRenderer>
      );
    case "spacer":
      return <div style={{ width: `${cell.width}px` }}></div>;
    case "group":
      return (
        <div>
          {cell.items.map((item) => (
            <LogsItemRenderer key={item.id} value={value} cell={item} />
          ))}
        </div>
      );
    default:
      return null;
  }
};

const alignMap: Record<
  NonNullable<ITrackableFlagValue<"LogsDisplay">["align"]>,
  string
> = {
  start: "justify-start",
  end: "justify-end",
  between: "justify-between",
};

export const LogsItemsRendered = ({
  items,
  value,
}: {
  items: ITrackableFlagValue<"LogsDisplay">;
  value: RecordValue;
}) => {
  return (
    <div
      className={cn("flex items-baseline", alignMap[items.align ?? "start"])}
    >
      {items.items.map((item) => (
        <LogsItemRenderer key={item.id} value={value} cell={item} />
      ))}
    </div>
  );
};

const LogsEntry = ({
  value,
  onEdit,
  onDelete,
  isBeingEdited,
  isEditing,
  displaySettings,
}: {
  value: RecordValue;
  isBeingEdited: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  displaySettings: ITrackableFlagValue<"LogsDisplay">;
}) => {
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <button
        className={cn(
          "text-foreground flex items-baseline gap-2",
          isBeingEdited && "text-blue-500",
          isEditing && !isBeingEdited && "opacity-30",
        )}
        onClick={onEdit}
      >
        <LogsItemsRendered items={displaySettings} value={value} />
      </button>
      <Button
        variant="ghost"
        size="sm"
        className="h-fit self-center p-0.5 opacity-50 hover:opacity-100"
        onClick={onDelete}
      >
        <XIcon size={14} />
      </Button>
    </div>
  );
};

export const LogsPopupEditor = ({
  data,
  onChange,
  onDelete,
}: PopupEditorProps) => {
  const { id } = useTrackableMeta();
  const displaySettings = useTrackableFlag(id, "LogsDisplay");

  const [editTargetIndex, setEditTargetIndex] = useState<number | null>(null);

  const values = data.values;

  const editTarget =
    editTargetIndex !== null ? values[editTargetIndex] : undefined;

  return (
    <>
      <ScrollArea
        className="mb-3 flex h-full max-h-[400px] flex-col px-4 md:mb-0.5"
        overscroll={false}
      >
        <ScrollBar orientation="vertical" />
        <div className="flex flex-col py-1.5">
          {values.map((v, i) => (
            <LogsEntry
              key={v.recordId}
              value={v}
              isBeingEdited={editTargetIndex === i}
              isEditing={editTargetIndex !== null}
              displaySettings={displaySettings}
              onEdit={() => {
                if (editTargetIndex === i) {
                  setEditTargetIndex(null);
                } else {
                  setEditTargetIndex(i);
                }
              }}
              onDelete={() => {
                void onDelete(v.recordId);
              }}
            />
          ))}
        </div>
      </ScrollArea>
      <div className="px-2 pb-4">
        <InputEditor
          key={editTargetIndex}
          initialValue={editTarget}
          onSubmit={async (newVal) => {
            if (!newVal.value) return;

            await onChange({
              value: newVal.value,
              attributes: newVal.attributes,
              recordId: editTarget?.recordId ?? undefined,
            });

            if (editTargetIndex !== null) {
              setEditTargetIndex(null);
            }
          }}
        />
      </div>
    </>
  );
};

type FormInputType = Pick<RecordValue, "attributes" | "value">;

const InputEditor = ({
  onSubmit,
  initialValue,
}: {
  onSubmit: (v: FormInputType) => void;
  initialValue?: FormInputType;
}) => {
  const { id } = useTrackableMeta();
  const attrs = useTrackableFlag(id, "LogsSavedAttributes");

  const form = useForm({
    defaultValues: initialValue ?? {
      value: "",
      attributes: {},
    },
    onSubmit: (data) => {
      void onSubmit(data.value);
    },
  });

  return (
    <div>
      <div className="flex gap-2">
        <form.Field
          name="value"
          children={(field) => (
            <Input
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void form.handleSubmit();
                  e.preventDefault();
                }
              }}
              value={field.state.value}
              onChange={(e) => {
                field.handleChange(e.target.value);
              }}
            />
          )}
        />

        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            void form.handleSubmit();
          }}
        >
          <CornerRightUp size={16} />
        </Button>
      </div>
      <div className="flex gap-2">
        {attrs.map((attribute) => {
          return (
            <form.Field
              key={attribute.key}
              name={`attributes.${attribute.key}`}
              children={(field) => {
                return (
                  <AttrbuteEditor
                    visibleName={attribute.visibleName || attribute.key}
                    type={attribute.type}
                    value={field.state.value}
                    onChange={(v) => field.handleChange(v)}
                  />
                );
              }}
            ></form.Field>
          );
        })}
      </div>
    </div>
  );
};

const AttrbuteEditor = ({
  visibleName,
  type,
  value,
  onChange,
}: {
  visibleName: string;
  type: "text" | "number" | "boolean";
  value?: string;
  onChange: (v: string) => void;
}) => {
  const id = useId();
  const inputId = `${id}-${visibleName}`;

  return (
    <div>
      <Label className="opacity-60" htmlFor={inputId}>
        {visibleName}
      </Label>
      {type === "text" && (
        <Input
          id={inputId}
          value={value}
          className="h-6"
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {type === "number" && (
        <Input
          id={inputId}
          type="number"
          className="h-6"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {type === "boolean" && (
        <Input
          id={inputId}
          type="checkbox"
          className="h-6"
          checked={value === "true"}
          onChange={(e) => onChange(e.target.checked.toString())}
        />
      )}
    </div>
  );
};
