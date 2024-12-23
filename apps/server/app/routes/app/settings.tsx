import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";

import { PreserveLocationOnSidebarNavSwitch } from "~/components/Settings";
import { ThemeSwitcher } from "~/components/Settings/themeSwitcher";
import { getTimezones } from "~/components/Settings/timzones";

export const Route = createFileRoute("/app/settings")({
  component: RouteComponent,
  loader: async ({ context }) => {
    const p = await Promise.all([getTimezones()]);
    return p[0];
  },
});

function RouteComponent() {
  const tz = Route.useLoaderData();

  return (
    <div className="content-container">
      <h3 className="w-full bg-inherit text-2xl font-semibold lg:text-3xl">
        Settings
      </h3>
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div>Theme</div>
          <ThemeSwitcher />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-xl">Preserve location on sidebar nav</h2>
          <div className="flex items-center gap-2">
            <PreserveLocationOnSidebarNavSwitch />
          </div>

          <p className="text-xs opacity-50">
            If enabled, when navigating to a new trackable in sidebar, app will
            keep current view and date. Otherwise, app will reset to month view
            and current date.
          </p>
        </div>

        <div>
          <div className="flex gap-2">
            <h2 className="text-xl">Timezone</h2>
          </div>

          <p className="mt-2 text-xs opacity-50">
            Used to accurately determine time when rendering on the server. Has
            no effect on mobile app.{" "}
          </p>
        </div>
      </div>
    </div>
  );
}
