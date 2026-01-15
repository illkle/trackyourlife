import { createFileRoute } from "@tanstack/react-router";

import { Button } from "~/@shad/components/button";

export const Route = createFileRoute("/app/testing")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto max-w-md">
      <Button isLoading={true}>Hello</Button>
      <Button isLoading={true} variant={"secondary"}>
        Open Sidebar
      </Button>
      <Button isLoading={true} variant={"ghost"}>
        Open Sidebar
      </Button>
      <Button isLoading={true} variant={"outline"}>
        Open Sidebar
      </Button>
      <Button isLoading={true} variant={"destructive"}>
        Open Sidebar
      </Button>
    </div>
  );
}
