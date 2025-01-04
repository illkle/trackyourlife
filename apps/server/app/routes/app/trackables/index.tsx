import { createFileRoute, Link } from "@tanstack/react-router";
import { ArchiveIcon } from "lucide-react";
import { z } from "zod";

import { Button } from "~/@shad/components/button";
import TrackablesList from "~/components/TrackablesList";

const SHOW_DAYS = 6;

export const Route = createFileRoute("/app/trackables/")({
  component: RouteComponent,
  validateSearch: z.object({
    archived: z.boolean().optional(),
  }),
});

function RouteComponent() {
  const params = Route.useSearch();

  return (
    <div className="content-container flex w-full flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold lg:text-3xl">
          {params.archived ? "Archive" : "Your Trackables"}
        </h2>

        <Button variant={"ghost"}>
          <Link
            from={Route.fullPath}
            search={(prev) => ({ ...prev, archived: !params.archived })}
          >
            {params.archived ? "Trackables" : "Archive"}
          </Link>
        </Button>
      </div>
      <div className="mt-2">
        <TrackablesList
          daysToShow={SHOW_DAYS}
          archived={params.archived || false}
        />
      </div>
    </div>
  );
}
