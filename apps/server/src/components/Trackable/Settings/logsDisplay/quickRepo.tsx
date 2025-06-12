import { useState } from "react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";

export default function TestComponentSort() {
  const [items, setItems] = useState({
    topLeft: ["A0", "A1", "A2"],
    topRight: ["B0", "B1"],
    middleLeft: [],
    middleRight: [],
    bottomLeft: [],
    bottomRight: [],
  });

  return (
    <DragDropProvider
      onDragOver={(event) => {
        const { source } = event.operation;

        if (source?.type === "column") return;

        setItems((items) => move(items, event));
      }}
    >
      <div className="grid grid-cols-2 gap-2 border p-2">
        {Object.entries(items).map(([column, items], index) => (
          <Column key={column} id={column} index={index}>
            {items.map((id, index) => (
              <Item key={id} id={id} index={index} column={column} />
            ))}
          </Column>
        ))}
      </div>
    </DragDropProvider>
  );
}

export function Column({
  children,
  id,
  index,
}: {
  children: React.ReactNode;
  id: string;
  index: number;
}) {
  const { ref } = useSortable({
    id,
    index,
    type: "column",
    collisionPriority: CollisionPriority.Low,
    accept: ["item", "column"],
  });

  return (
    <div className="flex gap-2 border border-red-300 p-2" ref={ref}>
      {children}
    </div>
  );
}

export function Item({
  id,
  index,
  column,
}: {
  id: string;
  index: number;
  column: string;
}) {
  const { ref, isDragging } = useSortable({
    id,
    index,
    type: "item",
    accept: "item",
    group: column,
  });

  return (
    <button className="Item" ref={ref} data-dragging={isDragging}>
      {id}
    </button>
  );
}
