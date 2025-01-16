import { createContext, useContext, useRef, useState } from "react";
import { m } from "framer-motion";

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
    console.log("reg", id);
    setIsOpen(true);
    if (unregister.current) {
      unregister.current();
    }

    unregister.current = toUnregister;
    setCurrentId(id);
  };

  const unreg = (id: string) => {
    if (currentId === id) {
      setIsOpen(false);
      unregister.current?.();
      unregister.current = null;
      setCurrentId(null);
    }
  };

  const ref = useRef<HTMLDivElement>(null);

  return (
    <>
      <m.div
        ref={ref}
        className={cn(
          "fixed bottom-4 left-1/2 z-[9999] h-[200px] w-full max-w-[600px] -translate-x-1/2 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 shadow-2xl",
          isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-20 opacity-0",
        )}
      ></m.div>
      <EditorModalContext.Provider
        value={{ registerClient: reg, unregisterClient: unreg, ref }}
      >
        {children}
      </EditorModalContext.Provider>
    </>
  );
};

export const useEditorModal = () => {
  const { registerClient, ref, unregisterClient } =
    useContext(EditorModalContext);

  if (!ref.current) throw new Error("EditorModalProvider not found");

  return { registerClient, ref, unregisterClient };
};
