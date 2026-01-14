import { useRef, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { v4 as uuidv4 } from "uuid";

import type { DbTrackableInsert } from "@tyl/db/server/schema";
import { usePowersyncDrizzle } from "@tyl/db/client/powersync/context";
import { insertTrackable } from "@tyl/db/client/powersync/trackable";
import { cloneDeep } from "@tyl/helpers";

import { Button } from "~/@shad/components/button";
import { Input } from "~/@shad/components/input";
import { TrackableTypeSelector } from "~/components/Trackable/Settings/trackableTypeSelector";
import { useUser } from "~/db/powersync-provider";

export const Route = createFileRoute("/app/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const db = usePowersyncDrizzle();
  const { userId } = useUser();

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

  const createTrackable = async () => {
    const id = uuidv4();
    await insertTrackable(db, {
      id,
      user_id: userId,
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

      <Button
        className="mt-2 flex justify-center gap-2"
        onClick={createTrackable}
      >
        Create
      </Button>
    </div>
  );
}
