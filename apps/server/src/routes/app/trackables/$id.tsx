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
  LayoutTemplateIcon,
  MoreHorizontalIcon,
  SettingsIcon,
  TrashIcon,
} from "lucide-react";
import { z } from "zod/v4";

import { mutators } from "@tyl/db/mutators";

import type { ITrackableFlagType } from "~/components/Trackable/TrackableProviders/trackableFlags";
import { AlertDialogTrigger } from "~/@shad/components/alert-dialog";
import { Button } from "~/@shad/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/@shad/components/dropdown-menu";
import { Spinner } from "~/@shad/components/spinner";
import DeleteButton from "~/components/Trackable/DeleteButton";
import { FavoriteButton } from "~/components/Trackable/FavoriteButton";
import { TrackableNameEditable } from "~/components/Trackable/TrackableName";
import {
  TrackableFlagsProvider,
  useSetTrackableFlag,
  useTrackableFlag,
} from "~/components/Trackable/TrackableProviders/TrackableFlagsProvider";
import TrackableProvider, {
  useTrackableMeta,
} from "~/components/Trackable/TrackableProviders/TrackableProvider";
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

  const isView = loc.pathname === `/app/trackables/${params.id}/view`;

  const [trackable] = useZeroTrackable({ id: params.id });

  if (!trackable) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const isArchived = trackable.trackableGroup.some(
    (tg) => tg.group === "archived",
  );

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
                      <span className="max-md:hidden">View</span>
                    </Button>
                  </Link>
                </>
              )}
              <TrackableDropdown isArchived={isArchived} />
            </div>
          </div>
          <hr className="bg-foreground outline-hidden my-4 h-px border-none opacity-10" />
          <Outlet />
        </div>
      </TrackableProvider>
    </TrackableFlagsProvider>
  );
}

const TrackableDropdown = ({ isArchived }: { isArchived: boolean }) => {
  const z = useZ();

  const { id } = useTrackableMeta();
  const setFlag = useSetTrackableFlag();

  const monthViewStyle = useTrackableFlag(id, "AnyMonthViewType");

  const setMonthViewStyle = async (
    style: ITrackableFlagType<"AnyMonthViewType">,
  ) => {
    await setFlag(id, "AnyMonthViewType", style);
  };

  return (
    <DeleteButton className="w-full" id={id}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className="min-w-44">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <LayoutTemplateIcon className="mr-1" />
              Month View Style
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={monthViewStyle}
                  className="min-w-46"
                  onValueChange={(style) =>
                    void setMonthViewStyle(
                      style as ITrackableFlagType<"AnyMonthViewType">,
                    )
                  }
                >
                  <DropdownMenuRadioItem value="calendar">
                    Calendar
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="list">
                    List
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuItem className="cursor-pointer" asChild>
            <Link to={"/app/trackables/$id/import"} params={{ id: id }}>
              <ImportIcon className="mr-1" /> Import
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              if (isArchived) {
                void mutators.trackableGroup.delete({
                  trackableId: id,
                  group: "archived",
                });
              } else {
                void mutators.trackableGroup.upsert({
                  trackableId: id,
                  group: "archived",
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
  );
};
