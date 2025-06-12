import { createFileRoute } from "@tanstack/react-router";

import { StrongConverter } from "~/components/Conveters/strong";

export const Route = createFileRoute("/converters/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <StrongConverter />
    </div>
  );
}
