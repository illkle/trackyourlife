import { createFileRoute } from "@tanstack/react-router";

import { UserSettings } from "~/components/UserAppSettings";

export const Route = createFileRoute("/app/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="pb-4">
      <h3 className="mb-4 w-full bg-inherit text-2xl font-semibold lg:text-3xl">Settings</h3>

      <h4 className="mb-2 text-lg">User Settings</h4>
      <UserSettings />
    </div>
  );
}
