import { createFileRoute } from "@tanstack/react-router";

import {
  openDayEditor,
  setIgnoreEditorModalClose,
} from "~/components/EditorModalV2";

export const Route = createFileRoute("/app/testing")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="class flex max-h-[200px] w-32 flex-col bg-red-200">
      <button
        onMouseUp={(e) => {
          setIgnoreEditorModalClose(e.nativeEvent);
          openDayEditor({ trackableId: "1", date: new Date() });
        }}
      >
        Open
      </button>
    </div>
  );
}
