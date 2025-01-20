import { useQuery } from "@rocicorp/zero/react";
import { createFileRoute, useRouter } from "@tanstack/react-router";

import type { ITrackableFlagsKV } from "~/components/TrackableFlags/TrackableFlagsProvider";
import { Spinner } from "~/@shad/components/spinner";
import TrackableSettings from "~/components/CreateAndSettingsFlows";
import { useTrackableMeta } from "~/components/Providers/TrackableProvider";
import { createFlagsObject } from "~/components/TrackableFlags/TrackableFlagsProvider";
import { useZ } from "~/utils/useZ";

export const Route = createFileRoute("/app/trackables/$id/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id, type } = useTrackableMeta();

  const z = useZ();
  const router = useRouter();

  const [flags, status] = useQuery(
    z.query.TYL_trackableFlags.where("trackableId", "=", id),
  );

  if (status.type === "unknown") {
    return (
      <div className="flex h-full min-h-[200px] w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const flagsObjects = createFlagsObject(flags);

  return (
    <>
      <TrackableSettings
        trackableType={type}
        initialSettings={flagsObjects}
        handleSave={async (v: ITrackableFlagsKV) => {
          await z.mutateBatch(async (m) => {
            const p = Object.entries(v).map(([key, value]) =>
              m.TYL_trackableFlags.insert({
                key,
                trackableId: id,
                value,
              }),
            );

            await Promise.all(p);
          });

          void router.navigate({
            to: `/app/trackables/${id}`,
          });
        }}
      />
    </>
  );
}
