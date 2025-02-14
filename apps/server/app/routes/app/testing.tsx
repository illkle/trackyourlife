import { useEffect, useState } from "react";
import { useQuery } from "@rocicorp/zero/react";
import { createFileRoute } from "@tanstack/react-router";

import { Button } from "~/@shad/components/button";
import { Input } from "~/@shad/components/input";
import { useTrackableFlag } from "~/components/Trackable/TrackableProviders/TrackableFlagsProvider";
import { useLinkedValue } from "~/utils/useDbLinkedValue";
import { useZ } from "~/utils/useZ";

export const Route = createFileRoute("/app/testing")({
  component: RouteComponent,
});
const id = "eb5dab0a-0711-40f5-86bd-182985046f6a";

function RouteComponent() {
  return <div className="flex flex-col"></div>;
}
