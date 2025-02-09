import { useRef } from "react";
import { Store, useStore } from "@tanstack/react-store";
import { useOnClickOutside } from "usehooks-ts";

import { Input } from "~/@shad/components/input";
import { GoodDrawer } from "~/components/Modal/goodDrawer";

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

const store = new Store<
  { data: EditorModalRegisterInput | null } & {
    isCollapsed: boolean;
  }
>({
  data: null,
  isCollapsed: false,
});

export const openDayEditor = (data: EditorModalRegisterInput) => {
  store.setState((state) => ({ ...state, data, isCollapsed: false }));
};

export const closeDayEditor = () => {
  store.setState((state) => ({ ...state, data: null }));
};

export const collapseDayEditor = () => {
  store.setState((state) => ({ ...state, isCollapsed: true }));
};

export const expandDayEditor = () => {
  store.setState((state) => ({ ...state, isCollapsed: false }));
};

export const EditorModalV2 = () => {
  const dayData = useStore(store, (state) => state.data);
  const isCollapsed = useStore(store, (state) => state.isCollapsed);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(
    wrapperRef,
    (e) => {
      console.log("clicked outside", e.ignoreEditorModalClose);
      if (e.ignoreEditorModalClose) {
        return;
      }
      collapseDayEditor();
    },
    "mouseup",
  );

  const state = dayData ? (isCollapsed ? "collapsed" : "opened") : "closed";

  return (
    <GoodDrawer
      ref={wrapperRef}
      data-state={state}
      onClick={() => {
        if (state === "collapsed") {
          expandDayEditor();
        }
      }}
    >
      <div
        key={dayData?.date.toISOString() + (dayData?.trackableId ?? "")}
        className="min-h-24 p-2 pt-4"
      >
        <Input autoFocus />
      </div>
    </GoodDrawer>
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
