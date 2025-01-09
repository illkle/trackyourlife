import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="content-container">
      <Outlet />
    </div>
  );
}
