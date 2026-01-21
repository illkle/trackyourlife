import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/testing")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div className="mx-auto max-w-md"></div>;
}
