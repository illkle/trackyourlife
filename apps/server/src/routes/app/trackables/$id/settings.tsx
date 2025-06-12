import { createFileRoute } from "@tanstack/react-router";

import TrackableSettingsV2 from "~/components/Trackable/Settings";

export const Route = createFileRoute("/app/trackables/$id/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return <TrackableSettingsV2 />;
}
