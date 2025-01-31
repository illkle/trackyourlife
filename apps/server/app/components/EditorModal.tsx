import type { HTMLAttributes, ReactNode } from "react";
import { createContext, useContext, useId, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "usehooks-ts";

import "~/@shad/components/dialog";

import { AnimatePresence, LayoutGroup, m } from "motion/react";
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
      <m.div
        ref={wrapperRef}
        data-hidden={!isOpen}
        layout
        layoutId={`editor-modal`}
        layoutRoot
        transition={{ duration: 2, ease: "easeInOut" }}
        className={cn(
          "fixed bottom-12 left-1/2 z-9999 max-h-[calc(20svh)] w-full max-w-[500px] rounded-md border border-neutral-800 bg-neutral-950 shadow-2xl shadow-neutral-950",
          "translate-x-[calc(-50%+var(--sidebar-offset)/2)] transition-all",
          "data-[hidden=true]:pointer-events-none data-[hidden=true]:opacity-0",
          "opacity-100 duration-1000 data-[hidden=true]:opacity-0",
        )}
      ></m.div>
      <EditorModalContext.Provider
        value={{
          registerClient: reg,
          unregisterClient: unreg,
          portalTarget: wrapperRef,
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

  return (
    <AnimatePresence mode="wait">
      {currentId === id && portalTarget.current && (
        <>{createPortal(children, portalTarget.current)}</>
      )}
    </AnimatePresence>
  );
};

// TODO: add ref expose
export const EditorModalTitle = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <m.div
      layout
      layoutId="editor-modal-title"
      className={cn(
        className,
        "flex items-center justify-between border-b border-neutral-200 px-4 py-1 text-sm font-bold dark:border-neutral-800",
      )}
    >
      {children}
    </m.div>
  );
};
