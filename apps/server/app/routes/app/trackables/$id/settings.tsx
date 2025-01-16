import { createFileRoute, useRouter } from "@tanstack/react-router";

import type { ITrackableSettings } from "@tyl/db/jsonValidators";

import TrackableSettings from "~/components/CreateAndSettingsFlows";
import { useTrackableMeta } from "~/components/Providers/TrackableProvider";
import { useZ } from "~/utils/useZ";

export const Route = createFileRoute("/app/trackables/$id/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id, type, settings } = useTrackableMeta();

  const z = useZ();

  const router = useRouter();

  return (
    <>
      <TrackableSettings
        trackableType={type}
        initialSettings={settings}
        handleSave={async (v: ITrackableSettings) => {
          await z.mutate.TYL_trackable.update({
            id,
            settings: v,
          });

          void router.navigate({
            to: `/app/trackables/${id}`,
          });
        }}
      />
    </>
  );
}
