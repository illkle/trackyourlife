import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  CalendarDaysIcon,
  LayoutTemplateIcon,
  MoreHorizontalIcon,
  SettingsIcon,
  TrashIcon,
} from "lucide-react";
import { z } from "zod/v4";

import { useGroupHandlers, useTrackable } from "@tyl/helpers/data/dbHooks";

import type { ITrackableFlagType } from "@tyl/helpers/data/trackableFlags";
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
import { QueryError } from "~/components/QueryError";
import DeleteButton from "~/components/Trackable/DeleteButton";
import { FavoriteButton } from "~/components/Trackable/FavoriteButton";
import { TrackableNameEditable } from "~/components/Trackable/TrackableName";
import {
  TrackableFlagsProviderExternal,
  useSetTrackableFlag,
  useTrackableFlag,
} from "@tyl/helpers/data/TrackableFlagsProvider";
import {
  TrackableGroupsProvider,
  useIsTrackableInGroup,
} from "@tyl/helpers/data/TrackableGroupsProvider";
import { TrackableMetaProvider, useTrackableMeta } from "@tyl/helpers/data/TrackableMetaProvider";

const paramsSchema = z.object({
  month: z.number().min(0).max(11).or(z.literal("list")).optional().default(new Date().getMonth()),
  year: z.number().min(1970).or(z.literal("list")).optional().default(new Date().getFullYear()),
});

const RouteComponent = () => {
  const params = Route.useParams();
  const loc = useLocation();

  const isView = loc.pathname === `/app/trackables/${params.id}/view`;

  const q = useTrackable({ id: params.id });
  const {
    data: [trackable],
  } = q;

  if (q.isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (q.error) {
    return <QueryError error={q.error} onRetry={q.refresh} />;
  }

  if (!trackable) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
        Trackable not found
      </div>
    );
  }

  return (
    <TrackableFlagsProviderExternal flagsSelect={trackable.flags}>
      <TrackableGroupsProvider groupsSelect={trackable.groups}>
        <TrackableMetaProvider trackable={trackable}>
          <div className="content-container flex h-full max-h-full w-full flex-col pb-6">
            <div className="grid grid-cols-2 gap-2 max-sm:grid-cols-1">
              <TrackableNameEditable />
              <div className="flex gap-2 justify-self-end">
                <FavoriteButton variant={"outline"} />
                {isView ? (
                  <>
                    <Link to={"/app/trackables/$id/settings"} params={{ id: params.id }}>
                      <Button name="settings" variant="outline">
                        <SettingsIcon className="h-4 w-4" />
                        <span className="max-md:hidden">Settings</span>
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to={"/app/trackables/$id/view"} params={{ id: params.id }}>
                      <Button variant="outline">
                        <CalendarDaysIcon className="h-4 w-4" />
                        <span className="max-md:hidden">View</span>
                      </Button>
                    </Link>
                  </>
                )}
                <TrackableDropdown />
              </div>
            </div>
            <hr className="my-4 h-px border-none bg-foreground opacity-10 outline-hidden" />
            <Outlet />
          </div>
        </TrackableMetaProvider>
      </TrackableGroupsProvider>
    </TrackableFlagsProviderExternal>
  );
};

const TrackableDropdown = () => {
  const { id } = useTrackableMeta();
  const setFlag = useSetTrackableFlag();

  const isArchived = useIsTrackableInGroup(id, "archived");
  const monthViewStyle = useTrackableFlag(id, "AnyMonthViewType");

  console.log("monthViewStyle", monthViewStyle);

  const { removeFromGroup, addToGroup } = useGroupHandlers();

  const setMonthViewStyle = async (style: ITrackableFlagType<"AnyMonthViewType">) => {
    await setFlag(id, "AnyMonthViewType", style);
  };

  const handleArchiveToggle = async () => {
    if (isArchived) {
      await removeFromGroup({
        trackableId: id,
        group: "archived",
      });
    } else {
      await addToGroup({
        trackableId: id,
        group: "archived",
      });
    }
  };

  return (
    <DeleteButton className="w-full" id={id}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline">
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          }
        />
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
                    void setMonthViewStyle(style as ITrackableFlagType<"AnyMonthViewType">)
                  }
                >
                  <DropdownMenuRadioItem value="calendar">Calendar</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="list">List</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuItem className="cursor-pointer" onClick={() => void handleArchiveToggle()}>
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

          <AlertDialogTrigger
            name="delete"
            nativeButton={false}
            render={
              <DropdownMenuItem className="cursor-pointer">
                <TrashIcon className="mr-1" /> Delete
              </DropdownMenuItem>
            }
          ></AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
    </DeleteButton>
  );
};

export const Route = createFileRoute("/app/trackables/$id")({
  component: RouteComponent,
  validateSearch: paramsSchema,
  loaderDeps: ({ search: { month, year } }) => ({ month, year }),
});
