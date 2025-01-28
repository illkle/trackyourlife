import { createContext, useContext, useId, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "usehooks-ts";

import "~/@shad/components/dialog";

import { createPortal } from "react-dom";
import { useOnClickOutside } from "usehooks-ts";

import { cn } from "~/@shad/utils";
import { useIsDesktop } from "~/utils/useIsDesktop";

interface EditorModalApi {
  registerClient: (id: string, toUnregister: () => void) => void;
  unregisterClient: (id: string) => void;
  portalTarget: React.RefObject<HTMLDivElement>;
  currentId: string | null;
}

const EditorModalContext = createContext<EditorModalApi>({
  registerClient: () => {
    return;
  },
  unregisterClient: () => {
    return;
  },
  portalTarget: { current: null },
  currentId: null,
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

  const portalRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(
    wrapperRef,
    () => {
      if (currentId) {
        unreg(currentId);
      }
    },
    "mouseup",
  );

  const isDesktop = useIsDesktop();

  useIsomorphicLayoutEffect(() => {
    if (currentId && !isDesktop) {
      unreg(currentId);
    }
  }, [isDesktop, currentId]);

  return (
    <>
      <div
        ref={wrapperRef}
        className={cn(
          "fixed bottom-14 left-1/2 z-9999 w-full max-w-[500px] rounded-md border border-neutral-800 bg-neutral-950 shadow-2xl shadow-neutral-950",
          "translate-x-[calc(-50%+var(--sidebar-offset)/2)] transition-all",
          isOpen ? "" : "hidden",
        )}
      >
        <div ref={portalRef}></div>
      </div>
      <EditorModalContext.Provider
        value={{
          registerClient: reg,
          unregisterClient: unreg,
          portalTarget: portalRef,
          currentId,
        }}
      >
        {children}
      </EditorModalContext.Provider>
    </>
  );
};

export const useEditorModal = () => {
  const ctx = useContext(EditorModalContext);

  return ctx;
};

export const EditorModal = ({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  const { registerClient, unregisterClient, currentId, portalTarget } =
    useEditorModal();

  const id = useId();

  useIsomorphicLayoutEffect(() => {
    if (open && currentId !== id) {
      registerClient(id, () => onOpenChange(false));
    }

    if (!open && currentId === id) {
      unregisterClient(id);
    }
  }, [open]);

  if (currentId === id && portalTarget.current) {
    return createPortal(children, portalTarget.current);
  }

  return null;
};
