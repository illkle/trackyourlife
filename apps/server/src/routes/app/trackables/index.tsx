import { createFileRoute, Link } from "@tanstack/react-router";
import { sub } from "date-fns";
import { z } from "zod/v4";
import { TrackableDataProvider } from "@tyl/helpers/data/TrackableDataProvider";
import { TrackableFlagsProvider } from "@tyl/helpers/data/TrackableFlagsProvider";
import { useNowDay } from "@tyl/helpers/date/clockStore";

import { Button } from "~/@shad/components/button";
import TrackablesList from "~/components/Trackable/TrackablesList";

const SHOW_DAYS = 6;

export const Route = createFileRoute("/app/trackables/")({
  component: RouteComponent,
  validateSearch: z.object({
    archived: z.boolean().optional(),
  }),
});

function RouteComponent() {
  const params = Route.useSearch();

  const today = useNowDay();
  const firstShown = sub(today, { days: SHOW_DAYS });

  return (
    <TrackableFlagsProvider fromArchive={params.archived ? true : undefined}>
      <TrackableDataProvider
        firstDay={firstShown}
        lastDay={today}
        fromArchive={params.archived ? true : undefined}
      >
        <div className="content-container flex w-full flex-col pb-6">
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
          <div>
            <TrackablesList daysToShow={SHOW_DAYS} archived={params.archived ?? false} />
          </div>
        </div>
      </TrackableDataProvider>
    </TrackableFlagsProvider>
  );
}
