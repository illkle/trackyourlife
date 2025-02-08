import { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { GripVertical, X } from "lucide-react";

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
import EditableText from "~/components/Inputs/EditableText";

export const LogsAttributeList = ({
  items,
  onChange,
}: {
  items: ILogsSavedAttribute[];
  onChange: (items: ILogsSavedAttribute[]) => void;
}) => {
  const [newKey, setNewKey] = useState("");
  const [newVisibleName, setNewVisibleName] = useState("");
  const [newType, setNewType] = useState<ILogsSavedAttribute["type"]>("text");

  const addItem = () => {
    if (
      newKey &&
      newVisibleName &&
      !items.some((item) => item.key === newKey)
    ) {
      onChange([
        ...items,
        {
          key: newKey,
          visibleName: newVisibleName,
          type: newType,
        },
      ]);
      setNewKey("");
      setNewVisibleName("");
      setNewType("text");
    }
  };

  const deleteItem = (id: string) => {
    onChange(items.filter((item) => item.key !== id));
  };

  const updateItem = (
    id: string,
    updatedItem: Partial<ILogsSavedAttribute>,
  ) => {
    onChange(
      items.map((item) =>
        item.key === id ? { ...item, ...updatedItem } : item,
      ),
    );
  };

  return (
    <div className="">
      <Reorder.Group
        axis="y"
        values={items}
        onReorder={onChange}
        className="space-y-2"
      >
        {items.map((item) => (
          <ListItem
            key={item.key}
            item={item}
            onDelete={deleteItem}
            onUpdate={updateItem}
          />
        ))}
      </Reorder.Group>
      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="newKey">Key</Label>
            <Input
              id="newKey"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Enter key"
            />
          </div>
          <div>
            <Label htmlFor="newVisibleName">Visible Name</Label>
            <Input
              id="newVisibleName"
              value={newVisibleName}
              onChange={(e) => setNewVisibleName(e.target.value)}
              placeholder="Enter visible name"
            />
          </div>
          <div>
            <Label htmlFor="newType">Type</Label>
            <Select
              value={newType}
              onValueChange={(value: ILogsSavedAttribute["type"]) =>
                setNewType(value)
              }
            >
              <SelectTrigger id="newType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={addItem} className="w-full">
          Add Item
        </Button>
      </div>
    </div>
  );
};

interface ListItemProps {
  item: ILogsSavedAttribute;
  onDelete: (key: string) => void;
  onUpdate: (key: string, updatedItem: Partial<ILogsSavedAttribute>) => void;
}

export function ListItem({ item, onDelete, onUpdate }: ListItemProps) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className="flex items-center rounded-md p-2"
    >
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 cursor-grab"
        onPointerDown={(e) => controls.start(e)}
      >
        <GripVertical className="h-4 w-4" />
      </Button>
      <div className="grid flex-grow grid-cols-3 items-center justify-between gap-2">
        <div className="text-sm font-medium">{item.key}</div>
        <EditableText
          value={item.visibleName}
          updater={(v) => onUpdate(item.key, { visibleName: v })}
          className="h-full text-sm"
        />
        <div className="text-muted-foreground text-sm">{item.type}</div>
      </div>
      <Button
        className="shrink-0"
        variant="ghost"
        size="icon"
        onClick={() => onDelete(item.key)}
      >
        <X className="h-4 w-4" />
      </Button>
    </Reorder.Item>
  );
}
