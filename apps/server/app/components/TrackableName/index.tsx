import { useState } from "react";

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
import { useTrackableMeta } from "~/components/Providers/TrackableProvider";
import { useIsDesktop } from "~/utils/useIsDesktop";
import { TrackableListItem, useZ, useZeroTrackable } from "~/utils/useZ";

export const TrackableNameEditable = () => {
  const { id } = useTrackableMeta();

  const z = useZ();

  const [trackable, trackableInfo] = useZeroTrackable({ id });
  const updateName = (name: string) => {
    void z.mutate.TYL_trackable.update({
      id,
      name,
    });
  };

  const [isEditing, setIsEditing] = useState(false);

  const [internalValue, setInternalValue] = useState("");

  const isDesktop = useIsDesktop();

  const saveHandler = () => {
    void updateName(internalValue);
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
              saveHandler();
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
    <>
      {trackable?.name.length
        ? trackable.name
        : `Unnamed ${trackable?.type ?? ""}`}
    </>
  );
};
