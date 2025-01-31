import { useState } from "react";
import { ScrollArea, ScrollAreaViewport } from "@radix-ui/react-scroll-area";
import { createFileRoute } from "@tanstack/react-router";
import { m } from "motion/react";

import { stringToColorHSL } from "@tyl/helpers/colorTools";

import { Input } from "~/@shad/components/input";
import { ScrollBar } from "~/@shad/components/scroll-area";
import { cn } from "~/@shad/utils";
import { EditorModal } from "~/components/EditorModal";

export const Route = createFileRoute("/app/testing")({
  component: RouteComponent,
});

const DropAModal = ({ className }: { className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Drop a modal</button>

      {isOpen && (
        <EditorModal open={isOpen} onOpenChange={setIsOpen}>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 4 }}
            layout
            exit={{ opacity: 0 }}
            layoutId="aslijdjaskld"
            className={cn(className)}
          >
            <m.div layout layoutId="asdasd" className="h-full w-full">
              {Math.random()}
            </m.div>
          </m.div>
        </EditorModal>
      )}
    </>
  );
};

function RouteComponent() {
  return (
    <div className="class flex max-h-[200px] w-32 flex-col bg-red-200">
      <DropAModal className="h-5" />

      <DropAModal className="h-16"></DropAModal>
    </div>
  );
}
