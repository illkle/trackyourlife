import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/testing")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div className="class flex h-[1000px] flex-col"></div>;
}
