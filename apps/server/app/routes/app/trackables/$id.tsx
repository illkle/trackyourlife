import { CalendarIcon, GearIcon } from "@radix-ui/react-icons";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { z } from "zod";

import { Button } from "~/@shad/button";
import DeleteButton from "~/components/DeleteButton";
import { FavoriteButton } from "~/components/FavoriteButton";
import TrackableProvider from "~/components/Providers/TrackableProvider";
import { TrackableNameEditable } from "~/components/TrackableName";
import { trpc } from "~/trpc/react";
import { fillPrefetchedTrackable } from "~/utils/fillPrefetched";

const getDataForTrackable = async (
  id: string,
  year: TParamsSchema["year"],
  month: TParamsSchema["month"],
) => {
  const yearValid = year !== "list";
  const monthValid = month !== "list";

  // Year view, prefetch full year
  if (yearValid && !monthValid) {
    const trackable = await trpc.trackablesRouter.getTrackableById.query({
      id,
      limits: {
        type: "year",
        year: year,
      },
    });

    return { trackable };
  }

  // Either both are valid, or we use special link that always gets us to current month
  if (monthValid && yearValid) {
    const trackable = await trpc.trackablesRouter.getTrackableById.query({
      id,
      limits: {
        type: "month",
        year: year,
        month: month,
      },
    });
    return { trackable };
  }

  // Nothing is valid. Show year view. We still prefetch current month, just to get trackable settings and info.
  const trackable = await trpc.trackablesRouter.getTrackableById.query({
    id,
    limits: {
      // This is equivalent fetching current month
      type: "last",
      days: 1,
    },
  });

  return { trackable };
};

const paramsSchema = z.object({
  month: z
    .number()
    .min(0)
    .max(11)
    .or(z.literal("list"))
    .optional()
    .default(new Date().getMonth()),
  year: z
    .number()
    .min(1970)
    .or(z.literal("list"))
    .optional()
    .default(new Date().getFullYear()),
});

type TParamsSchema = z.infer<typeof paramsSchema>;

export const Route = createFileRoute("/app/trackables/$id")({
  component: RouteComponent,
  validateSearch: paramsSchema,
  loaderDeps: ({ search: { month, year } }) => ({ month, year }),
  loader: async ({ context, deps: { month, year }, params }) => {
    const d = await getDataForTrackable(params.id, year, month);
    fillPrefetchedTrackable(context.queryClient, d.trackable);

    return { month, year };
  },
});

function RouteComponent() {
  const params = Route.useParams();

  return (
    <TrackableProvider id={params.id}>
      <div className="content-container flex h-full max-h-full w-full flex-col">
        <div className="flex w-full items-center justify-between">
          <TrackableNameEditable />
          <div className="flex gap-2">
            <FavoriteButton variant={"outline"} />
            <Link
              to={`/app/trackables/${params.id}/settings`}
              activeProps={{
                className: "hidden",
              }}
            >
              <Button name="settings" variant="outline" size="icon">
                <GearIcon className="h-4 w-4" />
              </Button>
            </Link>
            <Link
              to={`/app/trackables/${params.id}/view`}
              activeProps={{
                className: "hidden",
              }}
            >
              <Button variant="outline" size="icon">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </Link>
            <DeleteButton id={params.id} />
          </div>
        </div>
        <hr className="my-4 opacity-10" />
        <Outlet />
      </div>
    </TrackableProvider>
  );
}