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
      </div>
    </div>
  );
}
