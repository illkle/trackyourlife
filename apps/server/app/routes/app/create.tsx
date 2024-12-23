import * as React from "react";
import { useRef, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { v4 as uuidv4 } from "uuid";

import type { ITrackableSettings } from "@tyl/db/jsonValidators";
import { DbTrackableInsert, user } from "@tyl/db/schema";
import { cloneDeep } from "@tyl/helpers";

import { Input } from "~/@shad/components/input";
import { RadioTabItem, RadioTabs } from "~/@shad/components/radio-tabs";
import TrackableSettings from "~/components/TrackableSettings";
import { useSessionAuthed } from "~/utils/useSessionInfo";
import { useZ } from "~/utils/useZ";

export const Route = createFileRoute("/app/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const z = useZ();

  const { sessionInfo } = useSessionAuthed();

  const [newOne, setNewOne] = useState<DbTrackableInsert>({
    type: "boolean",
    name: "",
    settings: {},
    user_id: sessionInfo.user.id,
  });

  const nameRef = useRef("");

  const setType = (type: DbTrackableInsert["type"]) => {
    // This assumes that all settings fields are optional
    const update = cloneDeep(newOne);
    update.type = type;
    setNewOne(update);
  };

  const createTrackable = async (settings: ITrackableSettings) => {
    const id = uuidv4();
    await z.mutate.TYL_trackable.insert({
      id,
      ...newOne,
      name: nameRef.current || "",
      settings,
      is_deleted: false,
      attached_note: "",
    });

    void router.navigate({
      to: `/app/trackables/${id}`,
    });
  };

  return (
    <div className="content-container flex flex-col gap-2 pb-6">
      <h3 className="w-full bg-inherit text-2xl font-semibold lg:text-3xl">
        Create new Trackable
      </h3>

      <Input
        placeholder="Unnamed Trackable"
        className="mt-2"
        onChange={(e) => (nameRef.current = e.target.value)}
      />

      <RadioTabs
        value={newOne.type}
        onValueChange={(v) => setType(v as DbTrackableInsert["type"])}
        className="mt-2"
      >
        <RadioTabItem value="boolean" id="boolean" className="w-full">
          Boolean
        </RadioTabItem>
        <RadioTabItem value="number" id="number" className="w-full">
          Number
        </RadioTabItem>
        <RadioTabItem value="range" id="range" className="w-full">
          Range
        </RadioTabItem>
      </RadioTabs>
      <TrackableSettings
        trackableType={newOne.type}
        initialSettings={newOne.settings ?? {}}
        handleSave={createTrackable}
        customSaveButtonText="Create Trackable"
      />
    </div>
  );
}
