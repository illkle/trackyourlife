import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { m } from "motion/react";

import { cn } from "~/@shad/utils";
import {
  DynamicModal,
  DynamicModalContent,
  DynamicModalDescription,
  DynamicModalEditorTitle,
  DynamicModalTrigger,
} from "~/components/Modal/dynamicModal";

export const Route = createFileRoute("/app/testing")({
  component: RouteComponent,
});

const DropAModal = ({ className }: { className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DynamicModal open={isOpen} onOpenChange={setIsOpen}>
      <DynamicModalTrigger>Drop a modal</DynamicModalTrigger>
      <DynamicModalContent>
        <DynamicModalEditorTitle>Drop a modal</DynamicModalEditorTitle>
        <DynamicModalDescription>Drop a modal</DynamicModalDescription>

        <m.div layout layoutId="aslijdjaskld" className={cn(className)}>
          <m.div
            layout="preserve-aspect"
            layoutId="asdasd"
            className="h-full w-full"
          >
            {Math.random()}
          </m.div>
        </m.div>
      </DynamicModalContent>
    </DynamicModal>
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
