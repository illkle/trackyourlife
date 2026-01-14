import { useRef, useState } from "react";
import { useZero } from "@rocicorp/zero/react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { v4 as uuidv4 } from "uuid";

import { cloneDeep } from "@tyl/helpers";

import type { ITrackableZeroInsert } from "@tyl/db/client/zero-schema";
import type { DbTrackableInsert } from "@tyl/db/server/schema";
import { Button } from "~/@shad/components/button";
import { Input } from "~/@shad/components/input";
import { TrackableTypeSelector } from "~/components/Trackable/Settings/trackableTypeSelector";
import { useSessionAuthed } from "~/utils/useSessionInfo";
import { useZ } from "~/utils/useZ";
import { mutators } from "@tyl/db/server/zero-mutators";

export const Route = createFileRoute("/app/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const zero = useZero();

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

  const createTrackable = async () => {
    const id = uuidv4();
    await zero.mutate(
      mutators.trackable.insert({
        id,
        ...newOne,
        name: nameRef.current || "",
      }),
    );

    await router.navigate({
      to: `/app/trackables/${id}/settings`,
    });
  };

  return (
    <div className="content-container flex flex-col gap-2 pb-6">
      <h3 className="w-full bg-inherit text-2xl font-semibold lg:text-3xl">
        Create new Trackable
      </h3>

      <div className="h-2"></div>
      <Input
        placeholder="Unnamed Trackable"
        onChange={(e) => (nameRef.current = e.target.value)}
      />

      <div className="h-2"></div>
      <TrackableTypeSelector type={newOne.type} setType={setType} />

      <Button
        className="mt-2 flex justify-center gap-2"
        onClick={createTrackable}
      >
        Create
      </Button>
    </div>
  );
}
