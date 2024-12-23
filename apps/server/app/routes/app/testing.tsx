import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/testing")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div className="class flex w-fit flex-col">testing</div>;
}
