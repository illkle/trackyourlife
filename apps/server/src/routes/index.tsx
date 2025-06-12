import { createFileRoute, Navigate } from "@tanstack/react-router";

import { useSessionAuthed } from "~/utils/useSessionInfo";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const s = useSessionAuthed();

  if (s.sessionInfo.user.id) {
    return <Navigate to="/app" />;
  }

  return (
    <div className="p-2">
      <h3>TODO: Langing page</h3>
    </div>
  );
}
