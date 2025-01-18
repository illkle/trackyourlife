import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { cn } from "~/@shad/utils";
import { EditorModal } from "~/components/EditorModal";

export const Route = createFileRoute("/app/testing")({
  component: RouteComponent,
});

const BottomModalTest = ({ initialValue }: { initialValue: string }) => {
  const [state, setState] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <input value={state} onChange={(e) => setState(e.target.value)} />
      <button
        onClick={() => {
          setIsOpen(true);
        }}
        className={cn("bg-red-500", isOpen && "bg-blue-500")}
      >
        ssssssssss
      </button>
      <EditorModal open={isOpen} onOpenChange={setIsOpen}>
        aslkdjaklsdjlkasdjlaskdj
        <input
          value={state}
          onChange={(e) => setState(e.target.value)}
          autoFocus
        />
      </EditorModal>
    </div>
  );
};

function RouteComponent() {
  return (
    <div className="class flex h-[1000px] flex-col">
      <BottomModalTest initialValue="123123123123" />
      <BottomModalTest initialValue="sdxfsertf" />
      <BottomModalTest initialValue="qweqwewqe" />
    </div>
  );
}
