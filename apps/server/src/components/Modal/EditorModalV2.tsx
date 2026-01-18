import type { ListenerValue } from "@tanstack/react-store";
import type { HTMLMotionProps } from "motion/react";
import React, { RefObject, useEffect, useRef, useState } from "react";
import { cn } from "@shad/lib/utils";
import { useLocation } from "@tanstack/react-router";
import { Store, useStore } from "@tanstack/react-store";
import { addDays, subDays } from "date-fns";
import { AnimatePresence, m } from "motion/react";
import { useOnClickOutside } from "usehooks-ts";

import { useSidebar } from "~/@shad/components/sidebar";
import { PopupEditor } from "~/components/PopupEditor";
import { useIsMobile } from "~/utils/useIsDesktop";

/**
 * I much prefer the composition style modals where content is declared inside component that opens the modal
 * However here I think it's justified to move to a separate component with own state
 * 1. This makes daycells lighter
 * 2. Way easier to manage movement between days
 * 3. Easier to animate(framer motion becomes janky with portals)
 * 4. Editor is basically main feature of the app
 */

/**
 * This is the modal itself.
 * Content inside is located in component/PopupEditor.tsx
 */

interface EditorModalRegisterInput {
  trackableId: string;
  date: Date;
}

interface EditorModalStore {
  data: EditorModalRegisterInput | null;
  isCollapsed: boolean;
}

export const editorModalStore = new Store<EditorModalStore>({
  data: null,
  isCollapsed: false,
});

export const useAmIOpenInStore = (me: EditorModalRegisterInput) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const listener = (v: ListenerValue<EditorModalStore>) => {
      if (v.currentVal.isCollapsed) {
        setIsOpen(false);
        return;
      }

      const { date, trackableId } = v.currentVal.data ?? {};

      const isMe = date && trackableId ? me.trackableId === trackableId && me.date === date : false;

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

export const editorModalPreviousDay = () => {
  editorModalStore.setState((state) => ({
    ...state,
    data: state.data
      ? {
          trackableId: state.data.trackableId,
          date: subDays(state.data.date, 1),
        }
      : null,
  }));
};

export const editorModalNextDay = () => {
  editorModalStore.setState((state) => ({
    ...state,
    data: state.data
      ? {
          trackableId: state.data.trackableId,
          date: addDays(state.data.date, 1),
        }
      : null,
  }));
};
export const EditorModalV2 = () => {
  const dayData = useStore(editorModalStore, (state) => state.data);
  const isCollapsed = useStore(editorModalStore, (state) => state.isCollapsed);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isMobile = useIsMobile();

  const pathname = useLocation({
    select: (location) => location.pathname,
  });

  useEffect(() => {
    closeDayEditor();
  }, [pathname]);

  useOnClickOutside(
    wrapperRef as RefObject<HTMLElement>,
    (e) => {
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
    <>
      {/* On desktop it is cool that when modal is opened everything is still interactable, because it's easy to point mouse on empty space. Not so much on touch devices */}
      <AnimatePresence>
        {isMobile && state === "opened" && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 h-screen w-screen bg-black/30"
          ></m.div>
        )}
      </AnimatePresence>
      <MiniDrawer
        ref={wrapperRef}
        state={state}
        onMouseDown={(e) => {
          //
          if (
            e.target instanceof HTMLElement &&
            e.target.matches('input,textarea,[contenteditable="true"]')
          ) {
            return;
          }
          e.preventDefault();
          setIgnoreEditorModalClose(e.nativeEvent);
        }}
      >
        <AnimatePresence>
          {dayData && (
            <m.div exit={{ opacity: 0 }} className="flex max-h-[200px] flex-col">
              <PopupEditor
                date={dayData.date}
                trackableId={dayData.trackableId}
                key={dayData.date.toISOString() + dayData.trackableId}
              />
            </m.div>
          )}
        </AnimatePresence>
      </MiniDrawer>
    </>
  );
};

export const setIgnoreEditorModalClose = (e: MouseEvent | TouchEvent | FocusEvent) => {
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
 * - I fixed mobile autofocus aniation back in the day, but it got broken again after 1.0 refactors
 * - maintainer is slow to merge fixes
 * - there are lot of features that we don't need and that make fixing stuff harder
 * Therefore I decided to roll my own
 */

export const MiniDrawer = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & {
    state: "closed" | "collapsed" | "opened";
  }
>(({ children, state, ...props }, ref) => {
  const { isMobile, state: sidebarState } = useSidebar();

  const outerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (!window.visualViewport || !outerRef.current) return;

      /* The most stable way of positionning suggested by https://mathix.dev/blog/fix-html-elements-on-top-of-the-ios-keyboard-using-html-css-js
       * I tried to to bottom-0 and translate by window.innerHeight - (window.visualViewport.height + window.visualViewport.offsetTop), but that breaks when ios url bar is collapsed
       * And absolute + top window.visualViewport.height + window.scrollY - elHeight that suggested sometimes is supper jittery on scroll.
       */
      const position = Math.max(
        0,
        window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop,
      );

      outerRef.current.style.setProperty("--bottom-position", position + "px");
    };

    updateDimensions();

    window.addEventListener("resize", updateDimensions);
    window.visualViewport?.addEventListener("resize", updateDimensions);
    window.visualViewport?.addEventListener("scroll", updateDimensions);

    return () => {
      window.visualViewport?.removeEventListener("resize", updateDimensions);
      window.visualViewport?.removeEventListener("scroll", updateDimensions);
      window.removeEventListener("resize", updateDimensions);
    };
  }, [outerRef]);

  return (
    <>
      <m.div
        id="editorModal"
        ref={outerRef}
        data-sidebar-offset={isMobile ? false : sidebarState === "expanded"}
        data-state={state}
        className={cn(
          "left-1/2 z-50",
          "data-[state=closed]:translate-y-full data-[state=closed]:opacity-0",
          "data-[state=collapsed]:translate-y-[calc(100%-24px)]",
          "fixed bottom-[var(--bottom-position)] translate-y-[100vh]",
          "data-[sidebar-offset=false]:-translate-x-1/2 data-[sidebar-offset=true]:translate-x-[calc(-50%+var(--sidebar-offset,0px)/2)]",
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
            "border-border bg-background shadow-2xl",
            "pb-[100vh]",
          )}
        >
          {children}
        </m.div>
      </m.div>
    </>
  );
});

export const Debugger = () => {
  const [dimensions, setDimensions] = useState({
    scrollTop: window.scrollY,
    scrollHeight: window.document.documentElement.scrollHeight,
    innerHeight: window.innerHeight,
    clientHeight: window.document.documentElement.clientHeight,
    viewportHeight: window.visualViewport?.height ?? 0,
    offsetTop: window.visualViewport?.offsetTop ?? 0,
  });
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const updateDimensions = () => {
      const dimensions = {
        scrollTop: window.scrollY,
        scrollHeight: window.document.documentElement.scrollHeight,
        innerHeight: window.innerHeight,
        clientHeight: window.document.documentElement.clientHeight,
        viewportHeight: window.visualViewport?.height ?? 0,
        offsetTop: window.visualViewport?.offsetTop ?? 0,
      };

      setDimensions(dimensions);
      if (target.current) {
        if (!window.visualViewport) return;
        const offset =
          document.documentElement.clientHeight -
          (window.visualViewport.height + window.visualViewport.offsetTop);
        setOffset(offset);
        target.current.style.bottom = offset + "px";
      }
    };

    window.visualViewport?.addEventListener("resize", updateDimensions);
    window.visualViewport?.addEventListener("scroll", updateDimensions);

    return () => {
      window.visualViewport?.removeEventListener("resize", updateDimensions);
      window.visualViewport?.removeEventListener("scroll", updateDimensions);
    };
  }, []);

  const shoudOffsetBy = dimensions.innerHeight - dimensions.viewportHeight - dimensions.offsetTop;

  const target = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className="fixed top-4 right-4 z-50 -translate-y-[300px] rounded bg-secondary p-4 text-sm text-secondary-foreground opacity-75">
        <div>scrollTop: {Math.round(dimensions.scrollTop)}</div>
        <div>scrollHeight: {Math.round(dimensions.scrollHeight)}</div>
        <div>innerHeight: {Math.round(dimensions.innerHeight)}</div>
        <div>clientHeight: {Math.round(dimensions.clientHeight)}</div>
        <div>viewport height: {Math.round(dimensions.viewportHeight)}</div>
        <div>viewport offsetTop: {Math.round(dimensions.offsetTop)}</div>
        <div>should offset by: {Math.round(shoudOffsetBy)}</div>
      </div>
      <div ref={target} className="fixed bottom-0 h-40 w-full translate-z-0 bg-red-500">
        {offset}
        {Math.round(dimensions.innerHeight)} {Math.round(dimensions.viewportHeight)}{" "}
        {Math.round(dimensions.offsetTop)}
      </div>
    </>
  );
};
