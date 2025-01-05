import { createFileRoute } from "@tanstack/react-router";

import { useSessionAuthed } from "~/utils/useSessionInfo";
import { useZ } from "~/utils/useZ";

export const Route = createFileRoute("/app/testing")({
  component: RouteComponent,
});

function RouteComponent() {
  const z = useZ();

  const s = useSessionAuthed();

  return (
    <div className="class flex w-fit flex-col">
      user id {z.userID} session
      <div className="w-[400px] overflow-scroll">
        {" "}
        {JSON.stringify(s, null, 2)}
      </div>
    </div>
  );
}
