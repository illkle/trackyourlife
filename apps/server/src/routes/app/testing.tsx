import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod/v4";

import { Button } from "~/@shad/components/button";
import { Input } from "~/@shad/components/input";
import TestComponentSort from "~/components/Trackable/Settings/logsDisplay/quickRepo";

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
