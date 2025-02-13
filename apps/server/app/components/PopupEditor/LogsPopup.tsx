import { useId, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { CornerRightUp, XIcon } from "lucide-react";

import type { RecordAttribute, RecordValue } from "@tyl/helpers/trackables";

import type { PopupEditorProps } from "~/components/PopupEditor";
import { Button } from "~/@shad/components/button";
import { Input } from "~/@shad/components/input";
import { Label } from "~/@shad/components/label";
import { ScrollArea, ScrollBar } from "~/@shad/components/scroll-area";
import { cn } from "~/@shad/utils";
import { useTrackableFlag } from "~/components/Trackable/TrackableProviders/TrackableFlagsProvider";
import { useTrackableMeta } from "~/components/Trackable/TrackableProviders/TrackableProvider";

const LogsEntry = ({
  value,
  onEdit,
  onDelete,
  isBeingEdited,
  isEditing,
}: {
  value: RecordValue;
  isBeingEdited: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <button
        className={cn(
          "flex items-baseline gap-2 text-neutral-950 dark:text-neutral-100",
          isBeingEdited && "text-blue-500",
          isEditing && !isBeingEdited && "opacity-30",
        )}
        onClick={onEdit}
      >
        <span className="text-xs text-neutral-400 dark:text-neutral-600">
          {format(value.timestamp, "HH:mm:ss")}
        </span>
        {value.value}
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
  onAttributesChange,
}: PopupEditorProps) => {
  const [editTargetIndex, setEditTargetIndex] = useState<number | null>(null);

  const values = data.values;

  const editTarget =
    editTargetIndex !== null ? values[editTargetIndex] : undefined;

  return (
    <>
      <ScrollArea className="mb-3 flex h-full max-h-[400px] flex-col px-4 md:mr-11 md:mb-0.5">
        <ScrollBar orientation="vertical" />
        <div className="flex flex-col py-1.5">
          {values.map((v, i) => (
            <LogsEntry
              key={v.recordId}
              value={v}
              isBeingEdited={editTargetIndex === i}
              isEditing={editTargetIndex !== null}
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
            if (editTarget) {
              void onChange(
                newVal.value,
                editTarget.recordId,
                editTarget.createdAt ?? undefined,
              );

              void onAttributesChange(
                editTarget.recordId,
                newVal.attributes.map((a) => ({
                  ...a,
                  recordId: editTarget.recordId,
                })),
              );
            } else {
              const recordId = await onChange(
                newVal.value,
                undefined,
                new Date().getTime(),
              );

              void onAttributesChange(recordId, newVal.attributes);
            }

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
interface FormType {
  value: string;
  attributes: RecordAttribute[];
}

const InputEditor = ({
  onSubmit,
  initialValue,
}: {
  onSubmit: (v: FormType) => void;
  initialValue?: FormInputType;
}) => {
  const { id } = useTrackableMeta();
  const attrs = useTrackableFlag(id, "LogsSavedAttributes");

  const form = useForm<FormType>({
    defaultValues: {
      value: initialValue?.value ?? "",
      attributes: attrs.map((a) => ({
        key: a.key,
        value: initialValue?.attributes[a.key]?.value ?? "",
        type: a.type,
      })),
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
        <form.Field
          name="attributes"
          mode="array"
          children={(field) => {
            return (
              <>
                {field.state.value.map((a, i) => {
                  return (
                    <form.Field
                      key={i}
                      name={`attributes[${i}].value`}
                      children={(subField) => {
                        return (
                          <AttrbuteEditor
                            visibleName={attrs[i]?.visibleName ?? a.key}
                            type={a.type}
                            value={subField.state.value}
                            onChange={(v) => subField.handleChange(v)}
                          />
                        );
                      }}
                    ></form.Field>
                  );
                })}
              </>
            );
          }}
        />
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
