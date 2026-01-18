import { createFileRoute } from "@tanstack/react-router";

import { Button } from "~/@shad/components/button";
import { MaybeLoading } from "~/@shad/custom/maybe-loading";

export const Route = createFileRoute("/app/testing")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto max-w-md">
      <Button>
        <MaybeLoading isLoading={true}>Hello</MaybeLoading>
      </Button>
      <Button variant={"secondary"}>
        <MaybeLoading isLoading={true}>Open Sidebar</MaybeLoading>
      </Button>
      <Button variant={"ghost"}>
        <MaybeLoading isLoading={true}>Open Sidebar</MaybeLoading>
      </Button>
      <Button variant={"outline"}>
        <MaybeLoading isLoading={true}>Open Sidebar</MaybeLoading>
      </Button>
      <Button variant={"destructive"}>
        <MaybeLoading isLoading={true}>Open Sidebar</MaybeLoading>
      </Button>
    </div>
  );
}
