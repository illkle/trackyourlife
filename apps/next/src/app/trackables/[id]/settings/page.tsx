import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarIcon } from "@radix-ui/react-icons";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import SettingWrapperContext from "src/app/trackables/[id]/settings/settingsWrapper";

import { validateRequest } from "@tyl/auth";
import { Button } from "@tyl/ui/button";

import { fillPrefetchedTrackable } from "~/app/trackables/helpers";
import DeleteButton from "~/components/DeleteButton";
import { api } from "~/trpc/server";

const TrackableSettingsPage = async ({
  params,
}: {
  params: { id: string };
}) => {
  const { session } = await validateRequest();

  if (!session) redirect("/login");

  const trackable = await api.trackablesRouter.getTrackableById({
    id: params.id,
    limits: { type: "last", days: 1 },
  });

  const queryClient = new QueryClient();

  fillPrefetchedTrackable(queryClient, trackable);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="content-container flex h-full max-h-full w-full flex-col pb-6">
        <div className="mb-4 flex w-full items-center justify-between">
          <h2 className="w-full bg-inherit text-2xl font-semibold">Settings</h2>
          <Link href={`/trackables/${trackable.id}/`} className="mr-2">
            <Button variant="outline" size="icon">
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </Link>
          <DeleteButton id={trackable.id} />
        </div>

        <SettingWrapperContext id={trackable.id} />
      </div>
    </HydrationBoundary>
  );
};

export default TrackableSettingsPage;
