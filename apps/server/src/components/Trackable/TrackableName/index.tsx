import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/@shad/components/dialog";
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "~/@shad/components/drawer";
import { Input } from "~/@shad/components/input";
import { useTrackableMeta } from "~/components/Trackable/TrackableProviders/TrackableProvider";
import { useIsDesktop } from "~/utils/useIsDesktop";
import { useTrackableHandlers } from "@tyl/helpers/data/dbHooks";
import { Button } from "~/@shad/components/button";

export const TrackableNameEditable = () => {
  const { id, name, type } = useTrackableMeta();

  const [isEditing, setIsEditing] = useState(false);
  const [internalValue, setInternalValue] = useState("");
  const isDesktop = useIsDesktop();

  const { updateTrackableName } = useTrackableHandlers();

  const saveHandler = () => {
    void updateTrackableName({ id, name: internalValue });
    setIsEditing(false);
  };

  const display = (
    <h2 className="w-full truncate bg-inherit text-left text-xl font-semibold md:text-2xl">
      {name ? name : `Unnamed ${type ?? ""}`}
    </h2>
  );

  const openChangeHandler = (v: boolean) => {
    if (v === true) {
      setInternalValue(name ?? "");
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
        <Button variant={"outline"} onClick={saveHandler}>
          Save
        </Button>
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={isEditing} onClose={() => setIsEditing(false)} onOpenChange={openChangeHandler}>
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

export const TrackableNameText = () => {
  const { name, type } = useTrackableMeta();
  return <>{name.length ? name : `Unnamed ${type}`}</>;
};
