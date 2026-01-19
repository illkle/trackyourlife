import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "~/utils/useSessionInfo";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { session } = useAuth();

  if (!session?.session.userId) {
    return <Navigate to="/app" />;
  }

  return (
    <div className="p-2">
      <h3>TODO: Langing page</h3>
    </div>
  );
}
