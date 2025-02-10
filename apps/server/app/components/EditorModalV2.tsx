import type { HTMLMotionProps } from "motion/react";
import type { CSSProperties } from "react";
import React, { useEffect, useRef, useState } from "react";
import { Store, useStore } from "@tanstack/react-store";
import { m } from "motion/react";
import { useOnClickOutside } from "usehooks-ts";

import { useSidebar } from "~/@shad/components/sidebar";
import { cn } from "~/@shad/utils";
import { PopupEditor } from "~/components/PopupEditor";
import { useIsMobile } from "~/utils/useIsDesktop";

/**
 * I much prefer the radix-style modals where content is declared inside component that opens the modal
 * However here I think it's justified to move to a separate component with own state
 * 1. This makes daycells lighter
 * 2. Way easier to manage movement between days
 * 3. Easier to animate(framer motion becomes janky with portals)
 * 4. Editor is basically main feature of the app
 */

interface EditorModalRegisterInput {
  trackableId: string;
  date: Date;
}

export const editorModalStore = new Store<
  { data: EditorModalRegisterInput | null } & {
    isCollapsed: boolean;
  }
>({
  data: null,
  isCollapsed: false,
});

export const useAmIOpenInStore = (me: EditorModalRegisterInput) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const listener = (v: {
      currentVal: { data: EditorModalRegisterInput | null };
    }) => {
      const { date, trackableId } = v.currentVal.data ?? {};

      const isMe =
        date && trackableId
          ? me.trackableId === trackableId && me.date === date
          : false;

      setIsOpen(isMe);
    };

    editorModalStore.listeners.add(listener);

    return () => {
      editorModalStore.listeners.delete(listener);
    };
  }, [me.date, me.trackableId]);

  return isOpen;
};

export const openDayEditor = (data: EditorModalRegisterInput) => {
  editorModalStore.setState((state) => ({
    ...state,
    data,
    isCollapsed: false,
  }));
};

export const closeDayEditor = () => {
  const modal = document.getElementById("editorModal");
  // To prevent ios keyboard from staying despite focused input being removed
  if (modal && document.activeElement instanceof HTMLElement) {
    if (modal.contains(document.activeElement)) {
      document.activeElement.blur();
    }
  }
  editorModalStore.setState((state) => ({ ...state, data: null }));
};

export const collapseDayEditor = () => {
  editorModalStore.setState((state) => ({ ...state, isCollapsed: true }));
};

export const expandDayEditor = () => {
  editorModalStore.setState((state) => ({ ...state, isCollapsed: false }));
};

export const EditorModalV2 = () => {
  const dayData = useStore(editorModalStore, (state) => state.data);
  const isCollapsed = useStore(editorModalStore, (state) => state.isCollapsed);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isMobile = useIsMobile();

  useOnClickOutside(
    wrapperRef,
    (e) => {
      console.log("clicked outside", e.ignoreEditorModalClose);
      if (e.ignoreEditorModalClose) {
        return;
      }
      if (isMobile) {
        closeDayEditor();
      } else {
        collapseDayEditor();
      }
    },
    "mouseup",
  );

  const state = dayData ? (isCollapsed ? "collapsed" : "opened") : "closed";

  return (
    <MiniDrawer ref={wrapperRef} state={state}>
      <div
        className="max-h-[200px]"
        key={dayData?.date.toISOString() + (dayData?.trackableId ?? "")}
      >
        {dayData && (
          <PopupEditor date={dayData.date} trackableId={dayData.trackableId} />
        )}
      </div>
    </MiniDrawer>
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

/**
 * Inspired by https://vaul.emilkowal.ski/
 * there are multiple problems with it:
 * - on desktop when not using DrawerTriger there is no way to make page behind interacrable(this is a bug)
 * - on mobile drawer inputs with autofocus animate incorrectly on close.
 * - I fixed it back in the day, but it got broken again afte 1.0 refactors
 * - maintainer is slow to respond
 * - library is too complex for our use case
 * It's possible to patch package or figure out how to fix stuff there, but for now this will do
 */

export const MiniDrawer = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & {
    state: "closed" | "collapsed" | "opened";
  }
>(({ children, state, ...props }, ref) => {
  const { isMobile, state: sidebarState } = useSidebar();

  const outerRef = useRef<HTMLDivElement>(null);

  const [offset, setOffset] = useState(-1);

  useEffect(() => {
    const getOffset = () => {
      const vvh = window.visualViewport?.height ?? window.innerHeight;
      return vvh - window.innerHeight;
    };
    setOffset(getOffset());

    if (outerRef.current) {
      window.visualViewport?.addEventListener("resize", () => {
        setOffset(getOffset());
      });
    }
  }, [outerRef]);

  return (
    <m.div
      id="editorModal"
      ref={outerRef}
      data-sidebar-offset={isMobile ? false : sidebarState === "expanded"}
      data-state={state}
      style={
        {
          "--keyborad-offset": offset + "px",
        } as CSSProperties
      }
      className={cn(
        "fixed bottom-0 left-1/2 z-50",
        "data-[state=closed]:translate-y-full data-[state=closed]:opacity-0",
        "data-[state=collapsed]:translate-y-[calc(100%-24px+var(--keyborad-offset))]",
        "data-[state=opened]:translate-y-[var(--keyborad-offset)]",
        "data-[sidebar-offset=false]:-translate-x-1/2 data-[sidebar-offset=true]:translate-x-[calc(-50%+var(--sidebar-offset)/2)]",
        "transition-all duration-350",
        "data-[hidden=true]:pointer-events-none data-[hidden=true]:opacity-0",
        isMobile && state === "opened" && "hideCaretAnimation",
        props.className,
      )}
      onClick={() => {
        if (state === "collapsed") {
          expandDayEditor();
        }
      }}
      {...props}
    >
      <m.div
        ref={ref}
        style={{
          transformOrigin: "bottom",
        }}
        className={cn(
          "h-fit w-[500px] max-w-[100vw] rounded-t-md border border-b-0 shadow-2xl",
          "border-neutral-200 dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-neutral-950",
        )}
      >
        {children}
      </m.div>
    </m.div>
  );
});
