import type { ReactNode } from "react";
import { createContext, useContext, useId, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "usehooks-ts";

import "~/@shad/components/dialog";

import React from "react";
import { m } from "motion/react";
import { createPortal } from "react-dom";
import { useOnClickOutside } from "usehooks-ts";

import { cn } from "~/@shad/utils";
import { GoodDrawer } from "~/components/Modal/goodDrawer";
import { useIsDesktop } from "~/utils/useIsDesktop";

interface EditorModalApi {
  registerClient: (id: string, toUnregister: () => void) => void;
  unregisterClient: (id: string) => void;
  portalTarget: React.RefObject<HTMLDivElement>;
  currentId: string | null;
}

export const EditorModalContext = createContext<EditorModalApi>({
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

  const wrapperRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(
    wrapperRef,
    (e) => {
      if (e.ignoreEditorModalClose) {
        return;
      }
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
      <GoodDrawer ref={wrapperRef} data-hidden={!isOpen} />
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
    <>
      {currentId === id && portalTarget.current && (
        <>{createPortal(children, portalTarget.current, currentId)}</>
      )}
    </>
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
      className={cn(
        className,
        "flex items-center justify-between border-b border-neutral-200 px-4 py-1 text-sm font-bold dark:border-neutral-800",
      )}
    >
      {children}
    </m.div>
  );
};

export const setIgnoreEditorModalClose = (
  e: MouseEvent | TouchEvent | FocusEvent,
) => {
  e.ignoreEditorModalClose = true;
};

declare global {
  interface MouseEvent {
    ignoreEditorModalClose?: boolean;
  }
  interface TouchEvent {
    ignoreEditorModalClose?: boolean;
  }
  interface FocusEvent {
    ignoreEditorModalClose?: boolean;
  }
}
