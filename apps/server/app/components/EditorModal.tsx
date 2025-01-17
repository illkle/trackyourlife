import { createContext, useContext, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogPortal,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { m } from "framer-motion";

import "~/@shad/components/dialog";

import { cn } from "~/@shad/utils";

interface EditorModalApi {
  registerClient: (id: string, toUnregister: () => void) => void;
  unregisterClient: (id: string) => void;
  ref: React.RefObject<HTMLDivElement>;
}

const EditorModalContext = createContext<EditorModalApi>({
  registerClient: () => {
    return;
  },
  unregisterClient: () => {
    return;
  },
  ref: { current: null },
});

export const EditorModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const unregister = useRef<(() => void) | null>(null);

  const reg = (id: string, toUnregister: () => void) => {
    setIsOpen(true);
    console.log("reg", id);
    if (unregister.current) {
      unregister.current();
    }

    unregister.current = toUnregister;
    setCurrentId(id);
  };

  const unreg = (id: string) => {
    if (currentId === id) {
      console.log("unreg", id);
      setIsOpen(false);
      unregister.current?.();
      unregister.current = null;
      setCurrentId(null);
    }
  };

  const ref = useRef<HTMLDivElement>(null);

  return (
    <>
      <Dialog
        modal={false}
        open={false}
        onOpenChange={(v) => {
          if (!v) {
            setIsOpen(false);
          }
        }}
      >
        <DialogPortal>
          <DialogContent>
            <DialogDescription>aa</DialogDescription>
            <m.div
              className={cn(
                "fixed bottom-4 left-1/2 z-[9999] h-[200px] w-full max-w-[600px] -translate-x-1/2 overflow-y-scroll rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 shadow-2xl",
              )}
            >
              <DialogTitle>asdlksadjlksdj</DialogTitle>
              <div ref={ref}>asdlksadjlksdj</div>
            </m.div>
          </DialogContent>
        </DialogPortal>

        <EditorModalContext.Provider
          value={{ registerClient: reg, unregisterClient: unreg, ref }}
        >
          {children}
        </EditorModalContext.Provider>
      </Dialog>
    </>
  );
};

export const useEditorModal = () => {
  const { registerClient, ref, unregisterClient } =
    useContext(EditorModalContext);

  return { registerClient, ref, unregisterClient };
};
