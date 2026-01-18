import { useRef, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";

import type { DbTrackableInsert } from "@tyl/db/server/schema";
import { cloneDeep } from "@tyl/helpers";

import { Button } from "~/@shad/components/button";
import { Input } from "~/@shad/components/input";
import { TrackableTypeSelector } from "~/components/Trackable/Settings/trackableTypeSelector";
import { useTrackableHandlers } from "@tyl/helpers/dbHooks";

export const Route = createFileRoute("/app/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();

  const { createTrackable } = useTrackableHandlers();

  const [newOne, setNewOne] = useState<{
    type: "boolean" | "number" | "text";
    name: string;
  }>({
    type: "boolean",
    name: "",
  });

  const nameRef = useRef("");

  const setType = (type: DbTrackableInsert["type"] | string) => {
    if (type === "boolean" || type === "number" || type === "text") {
      const update = cloneDeep(newOne);
      update.type = type;
      setNewOne(update);
    }
  };

  const handleCreate = async () => {
    const id = await createTrackable({
      name: nameRef.current || "",
      type: newOne.type,
    });

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

      <Button className="mt-2 flex justify-center gap-2" onClick={handleCreate}>
        Create
      </Button>
    </div>
  );
}
