import { useRef, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { v4 as uuidv4 } from "uuid";

import type { ITrackableSettings } from "@tyl/db/jsonValidators";
import type { DbTrackableInsert } from "@tyl/db/schema";
import { cloneDeep } from "@tyl/helpers";

import { Input } from "~/@shad/components/input";
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

      <RadioGroup
        value={newOne.type}
        onValueChange={(v) => setType(v as DbTrackableInsert["type"])}
        className="grid grid-cols-5 items-start gap-4"
      >
        <RadioGroupItem value="boolean" id="boolean">
          <p className="text-lg font-semibold">Boolean</p>

          <p className="text-sm">
            True or false. Can be used for habit tracking or as a checkbox.
          </p>
        </RadioGroupItem>
        <RadioGroupItem value="number" id="number">
          <p className="text-lg font-semibold">Number</p>

          <p className="text-sm">
            Can represent a count like steps walked, measurement like weight, or
            rating like mood on 1-10 scale.
          </p>
        </RadioGroupItem>
        <RadioGroupItem value="text" id="text" disabled>
          <p className="text-lg font-semibold">Text</p>
          <p className="text-sm">
            Simple block of text for each day. You can use it as a note or a
            gratitude journal.
          </p>
        </RadioGroupItem>

        <RadioGroupItem value="text" id="text" disabled>
          <p className="text-lg font-semibold">Tags</p>
          <p className="text-sm">
            A collection of values where frequency of occurrence is being
            tracked. For example, emotions you felt, general activities you did,
            etc.
          </p>
        </RadioGroupItem>
        <RadioGroupItem value="text" id="text" disabled>
          <p className="text-lg font-semibold">Logs</p>
          <p className="text-sm">
            Collection of values that are relatively unique each time and where
            record attributes are important. Can be tasks closed today,
            exercises done in the gym, food eaten, etc.
          </p>
        </RadioGroupItem>
      </RadioGroup>
      <TrackableSettings
        trackableType={newOne.type}
        initialSettings={newOne.settings ?? {}}
        handleSave={createTrackable}
        customSaveButtonText="Create Trackable"
      />
    </div>
  );
}
