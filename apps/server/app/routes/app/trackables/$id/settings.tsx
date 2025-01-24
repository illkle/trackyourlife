import { useEffect, useState } from "react";
import { useQuery } from "@rocicorp/zero/react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

import { cloneDeep } from "@tyl/helpers";

import type { ITrackableFlagsKV } from "~/components/TrackableProviders/TrackableFlagsProvider";
import { Alert } from "~/@shad/components/alert";
import { Button } from "~/@shad/components/button";
import { Spinner } from "~/@shad/components/spinner";
import TrackableSettings from "~/components/CreateAndSettingsFlows";
import { createFlagsObjectWithoutId } from "~/components/TrackableProviders/TrackableFlagsProvider";
import { useTrackableMeta } from "~/components/TrackableProviders/TrackableProvider";
import { useZ } from "~/utils/useZ";

export const Route = createFileRoute("/app/trackables/$id/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id, type } = useTrackableMeta();

  const router = useRouter();

  const z = useZ();
  const [flags, status] = useQuery(
    z.query.TYL_trackableFlags.where("trackableId", "=", id),
  );

  const [isPending, setIsPending] = useState(true);
  const [stableValue, setStableValue] = useState<ITrackableFlagsKV | null>(
    null,
  );
  const [hasUpdate, setHasUpdate] = useState(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (status.type === "unknown") {
      return;
    }

    if (!isPending) {
      setHasUpdate(true);
      return;
    }
    setStableValue(createFlagsObjectWithoutId(flags));
    setIsPending(false);
  }, [status.type, flags]);

  if (isPending || !stableValue) {
    return (
      <div className="flex h-full min-h-[200px] w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <TrackableSettings
        key={formKey}
        trackableType={type}
        initialSettings={stableValue}
        handleSave={async (v: ITrackableFlagsKV) => {
          await z.mutateBatch(async (m) => {
            const p = Object.entries(v).map(([key, value]) =>
              m.TYL_trackableFlags.upsert({
                key,
                trackableId: id,
                value: cloneDeep(value),
              }),
            );

            await Promise.all(p);
          });

          void router.navigate({
            to: `/app/trackables/${id}`,
          });
        }}
      />
      {hasUpdate && (
        <Alert variant="destructive" className="mt-4 flex items-center gap-2">
          <TriangleAlert size={20} />
          <span className="flex-1">
            Warning: these settings were modified somewhere else after you
            loaded this page.
            <br />
            You might lose previous changes on save.
          </span>
          <div className="w-full max-w-40">
            <Button
              size="sm"
              className="w-full"
              onClick={() => {
                setStableValue(createFlagsObjectWithoutId(flags));
                setHasUpdate(false);
                setFormKey((k) => k + 1);
              }}
            >
              Refresh
            </Button>
          </div>
        </Alert>
      )}
    </>
  );
}
