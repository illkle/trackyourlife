import { useState } from "react";

import { usePowersyncDrizzle } from "@tyl/db/client/powersync/context";
import { updateTrackable } from "@tyl/db/client/powersync/trackable";

import type { TrackableListItem } from "~/utils/useZ";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/@shad/components/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "~/@shad/components/drawer";
import { Input } from "~/@shad/components/input";
import { useTrackableMeta } from "~/components/Trackable/TrackableProviders/TrackableProvider";
import { useIsDesktop } from "~/utils/useIsDesktop";
import { useZeroTrackable } from "~/utils/useZ";

export const TrackableNameEditable = () => {
  const { id } = useTrackableMeta();
  const db = usePowersyncDrizzle();

  const [trackable] = useZeroTrackable({ id });

  const handleUpdateName = async (name: string) => {
    await updateTrackable(db, { id, name });
  };

  const [isEditing, setIsEditing] = useState(false);
  const [internalValue, setInternalValue] = useState("");
  const isDesktop = useIsDesktop();

  const saveHandler = () => {
    void handleUpdateName(internalValue);
    setIsEditing(false);
  };

  const display = (
    <h2 className="w-full truncate bg-inherit text-left text-xl font-semibold md:text-2xl">
      {trackable?.name ? trackable.name : `Unnamed ${trackable?.type ?? ""}`}
    </h2>
  );

  const openChangeHandler = (v: boolean) => {
    if (v === true) {
      setInternalValue(trackable?.name ?? "");
    }
    setIsEditing(v);
  };

  return isDesktop ? (
    <Dialog open={isEditing} onOpenChange={openChangeHandler}>
      <DialogTrigger>{display}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Trackable</DialogTitle>
        </DialogHeader>
        <Input
          autoFocus
          className="w-full"
          value={internalValue}
          onChange={(e) => setInternalValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              void saveHandler();
            }
          }}
        />
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer
      open={isEditing}
      onClose={() => setIsEditing(false)}
      onOpenChange={openChangeHandler}
    >
      <DrawerTrigger>{display}</DrawerTrigger>
      <DrawerContent className="py-4">
        <DrawerTitle>Rename Trackable</DrawerTitle>

        <div className="p-6">
          <Input
            autoFocus
            className="w-full text-center"
            value={internalValue}
            onChange={(e) => setInternalValue(e.target.value)}
            onBlur={saveHandler}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export const TrackableNameText = ({
  trackable,
}: {
  trackable: TrackableListItem;
}) => {
  return (
    <>{trackable.name.length ? trackable.name : `Unnamed ${trackable.type}`}</>
  );
};
