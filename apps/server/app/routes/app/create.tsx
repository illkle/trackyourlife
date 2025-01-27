import { useRef, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { v4 as uuidv4 } from "uuid";

import type { DbTrackableInsert } from "@tyl/db/schema";
import { cloneDeep } from "@tyl/helpers";

import type { ITrackableFlagsKV } from "~/components/TrackableProviders/trackableFlags";
import type { ITrackableZeroInsert } from "~/schema";
import { Input } from "~/@shad/components/input";
import TrackableSettings from "~/components/CreateAndSettingsFlows";
import { SettingsTitle } from "~/components/CreateAndSettingsFlows/settingsTitle";
import { TrackableTypeSelector } from "~/components/CreateAndSettingsFlows/trackableTypeSelector";
import { useSessionAuthed } from "~/utils/useSessionInfo";
import { useZ } from "~/utils/useZ";

export const Route = createFileRoute("/app/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const z = useZ();

  const { sessionInfo } = useSessionAuthed();

  const [newOne, setNewOne] = useState<
    Omit<ITrackableZeroInsert, "id" | "user_id">
  >({
    type: "boolean",
    name: "",
  });

  const nameRef = useRef("");

  const setType = (type: DbTrackableInsert["type"]) => {
    // This assumes that all settings fields are optional
    const update = cloneDeep(newOne);
    update.type = type;
    setNewOne(update);
  };

  const createTrackable = async (settings: ITrackableFlagsKV) => {
    const id = uuidv4();
    await z.mutate.TYL_trackable.insert({
      id,
      ...newOne,
      name: nameRef.current || "",
      user_id: sessionInfo.user.id,
    });

    await z.mutateBatch(async (m) => {
      const p = Object.entries(settings).map(([key, value]) =>
        m.TYL_trackableFlags.insert({
          user_id: z.userID,
          key,
          trackableId: id,
          value: value,
        }),
      );

      await Promise.all(p);
    });

    await router.navigate({
      to: `/app/trackables/${id}`,
    });
  };

  return (
    <div className="content-container flex flex-col gap-2 pb-6">
      <h3 className="w-full bg-inherit text-2xl font-semibold lg:text-3xl">
        Create new Trackable
      </h3>
      <SettingsTitle>Name</SettingsTitle>
      <Input
        placeholder="Unnamed Trackable"
        onChange={(e) => (nameRef.current = e.target.value)}
      />

      <SettingsTitle>Type</SettingsTitle>
      <TrackableTypeSelector type={newOne.type} setType={setType} />

      <TrackableSettings
        trackableType={newOne.type}
        handleSave={createTrackable}
        customSaveButtonText="Create Trackable"
      />
    </div>
  );
}
