import { useLayoutEffect, useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { X } from "lucide-react";
import { z } from "zod";

import type { ILogsSavedAttribute } from "~/components/Trackable/TrackableProviders/trackableFlags";
import { Button } from "~/@shad/components/button";
import { Input } from "~/@shad/components/input";
import { Label } from "~/@shad/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/@shad/components/select";
import { FieldInfo } from "~/components/AuthFlows";
import { RenderTrackableIcon } from "~/utils/trackableIcons";

export const AttributeEditor = ({
  attribute,
  onSave,
  onCancel,
  existingKeys = new Set(),
}: {
  attribute?: ILogsSavedAttribute;
  onSave: (attribute: ILogsSavedAttribute) => void;
  onCancel?: () => void;
  existingKeys?: Set<string>;
}) => {
  const isEditMode = !!attribute;

  const form = useForm({
    defaultValues: {
      key: attribute?.key ?? "",
      visibleName: attribute?.visibleName ?? "",
      type: attribute?.type ?? ("text" as ILogsSavedAttribute["type"]),
    },
    onSubmit: ({ value }) => {
      onSave({
        key: value.key,
        visibleName: value.visibleName,
        type: value.type,
      });
      form.reset();
    },
    validators: {
      onChange: z.object({
        key: z
          .string()
          .min(1, "Key is required")
          .refine((v) => !existingKeys.has(v), {
            message: "Duplicate key",
          }),
        visibleName: z.string().min(1, "Label is required"),
        type: z.enum(["text", "number", "boolean"]),
      }),
    },
  });

  useLayoutEffect(() => {
    if (form.state.values.key !== attribute?.key) {
      form.reset();
    }
  }, [attribute, form]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
      className="grid grid-cols-4 gap-2"
    >
      <div>
        <Label htmlFor="attributeKey">Key</Label>
        <form.Field
          name="key"
          children={(field) => (
            <>
              <Input
                className="mt-1"
                id="attributeKey"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter key"
                disabled={isEditMode} // Disable key editing in edit mode
              />
              <FieldInfo field={field} />
            </>
          )}
        />
      </div>
      <div>
        <Label htmlFor="attributeVisibleName">Label</Label>
        <form.Field
          name="visibleName"
          children={(field) => (
            <>
              <Input
                className="mt-1"
                id="attributeVisibleName"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Enter visible name"
              />
              <FieldInfo field={field} />
            </>
          )}
        />
      </div>
      <div>
        <Label htmlFor="attributeType">Type</Label>
        <form.Field
          name="type"
          children={(field) => (
            <Select
              value={field.state.value}
              onValueChange={(value: ILogsSavedAttribute["type"]) =>
                field.handleChange(value)
              }
            >
              <SelectTrigger className="mt-1" id="attributeType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="mt-7 flex gap-2">
        <Button variant={"outline"} type="submit" className="flex-1">
          {isEditMode ? "Save" : "Add Item"}
        </Button>
        {onCancel && (
          <Button
            variant={"ghost"}
            onClick={onCancel}
            type="button"
            className="flex-shrink-0"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export const LogsAttributeList = ({
  items,
  onChange,
}: {
  items: ILogsSavedAttribute[];
  onChange: (items: ILogsSavedAttribute[]) => void;
}) => {
  const [editingItem, setEditingItem] = useState<ILogsSavedAttribute | null>(
    null,
  );

  const addItem = (newAttribute: ILogsSavedAttribute) => {
    if (!items.some((item) => item.key === newAttribute.key)) {
      onChange([...items, newAttribute]);
    }
  };

  const updateItem = (updatedAttribute: ILogsSavedAttribute) => {
    onChange(
      items.map((item) =>
        item.key === updatedAttribute.key ? updatedAttribute : item,
      ),
    );
    setEditingItem(null);
  };

  const deleteItem = (id: string) => {
    onChange(items.filter((item) => item.key !== id));
  };

  const existingKeys = useMemo(() => {
    return new Set(items.map((item) => item.key));
  }, [items]);

  return (
    <div className="">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div key={item.key} className="flex items-stretch gap-0">
            <Button
              variant={editingItem?.key === item.key ? "default" : "outline"}
              className="flex h-10 items-center gap-4 rounded-r-none border-r-0 py-1"
              onClick={() => setEditingItem(item)}
            >
              <RenderTrackableIcon
                type={item.type}
                size={16}
                className="shrink-0"
              />
              <div className="flex items-baseline gap-2">
                <div>{item.visibleName}</div>
                <div className="font-mono text-xs">{item.key}</div>
              </div>
            </Button>
            <Button
              variant={"outline"}
              size={"icon"}
              className="h-10 rounded-l-none"
              onClick={() => deleteItem(item.key)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {editingItem ? (
          <AttributeEditor
            attribute={editingItem}
            onSave={(v) => updateItem(v)}
            onCancel={() => setEditingItem(null)}
            existingKeys={existingKeys}
          />
        ) : (
          <AttributeEditor
            onSave={(v) => addItem(v)}
            existingKeys={existingKeys}
          />
        )}
      </div>
    </div>
  );
};
