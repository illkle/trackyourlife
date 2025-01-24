import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  CalendarDaysIcon,
  ImportIcon,
  MoreHorizontalIcon,
  SettingsIcon,
  TrashIcon,
} from "lucide-react";
import { z } from "zod";

import { AlertDialogTrigger } from "~/@shad/components/alert-dialog";
import { Button } from "~/@shad/components/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/@shad/components/dropdown-menu";
import { Spinner } from "~/@shad/components/spinner";
import DeleteButton from "~/components/DeleteButton";
import { FavoriteButton } from "~/components/FavoriteButton";
import { TrackableNameEditable } from "~/components/TrackableName";
import { TrackableFlagsProvider } from "~/components/TrackableProviders/TrackableFlagsProvider";
import TrackableProvider from "~/components/TrackableProviders/TrackableProvider";
import { useZ, useZeroTrackable } from "~/utils/useZ";

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

export const Route = createFileRoute("/app/trackables/$id")({
  component: RouteComponent,
  validateSearch: paramsSchema,
  loaderDeps: ({ search: { month, year } }) => ({ month, year }),
});

function RouteComponent() {
  const params = Route.useParams();
  const loc = useLocation();

  const z = useZ();

  const isView = loc.pathname === `/app/trackables/${params.id}/view`;

  const [trackable] = useZeroTrackable({ id: params.id });

  const isArchived = trackable?.trackableGroup.some(
    (tg) => tg.group === "archived",
  );

  if (!trackable) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <TrackableFlagsProvider trackableIds={[params.id]}>
      <TrackableProvider trackable={trackable}>
        <div className="content-container flex h-full max-h-full w-full flex-col pb-6">
          <div className="grid grid-cols-2 gap-2 max-sm:grid-cols-1">
            <TrackableNameEditable />
            <div className="flex gap-2 justify-self-end">
              <FavoriteButton variant={"outline"} trackable={trackable} />
              {isView ? (
                <>
                  <Link
                    to={"/app/trackables/$id/settings"}
                    params={{ id: params.id }}
                  >
                    <Button name="settings" variant="outline">
                      <SettingsIcon className="h-4 w-4" />
                      <span className="max-md:hidden">Settings</span>
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={"/app/trackables/$id/view"}
                    params={{ id: params.id }}
                  >
                    <Button variant="outline">
                      <CalendarDaysIcon className="h-4 w-4" />
                      <span className="max-md:hidden">Calendar</span>
                    </Button>
                  </Link>
                </>
              )}

              <DeleteButton className="w-full" id={params.id}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="bottom"
                    align="end"
                    className="min-w-44"
                  >
                    <DropdownMenuItem className="cursor-pointer" asChild>
                      <Link
                        to={"/app/trackables/$id/import"}
                        params={{ id: params.id }}
                      >
                        <ImportIcon className="mr-1" /> Import
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        if (isArchived) {
                          void z.mutate.TYL_trackableGroup.delete({
                            trackableId: params.id,
                            group: "archived",
                          });
                        } else {
                          void z.mutate.TYL_trackableGroup.upsert({
                            trackableId: params.id,
                            group: "archived",
                            user_id: z.userID,
                          });
                        }
                      }}
                    >
                      {isArchived ? (
                        <>
                          <ArchiveRestoreIcon className="mr-1" /> Unarchve
                        </>
                      ) : (
                        <>
                          <ArchiveIcon className="mr-1" /> Archive
                        </>
                      )}
                    </DropdownMenuItem>

                    <AlertDialogTrigger name="delete" asChild>
                      <DropdownMenuItem className="cursor-pointer">
                        <TrashIcon className="mr-1" /> Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>
              </DeleteButton>
            </div>
          </div>
          <hr className="my-4 h-[1px] border-none bg-neutral-900 opacity-10 outline-none dark:bg-neutral-50" />
          <Outlet />
        </div>
      </TrackableProvider>
    </TrackableFlagsProvider>
  );
}
