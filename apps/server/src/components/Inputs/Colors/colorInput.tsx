import { useContext } from "react";
import { PopoverContent } from "@radix-ui/react-popover";

import type { IColorValue } from "@tyl/db/jsonValidators";
import { presetsMap } from "@tyl/helpers/colorPresets";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerMobileTitleContext,
  DrawerTitle,
  DrawerTrigger,
} from "~/@shad/components/drawer";
import { Popover, PopoverTrigger } from "~/@shad/components/popover";
import { ColorDisplay } from "~/components/Inputs/Colors/colorDisplay";
import ColorPicker from "~/components/Inputs/Colors/colorPicker";
import { useLinkedValue } from "~/utils/useDbLinkedValue";
import { useIsDesktop } from "~/utils/useIsDesktop";

const ColorInput = ({
  value = presetsMap.neutral,
  onChange,
}: {
  value?: IColorValue;
  onChange: (v: IColorValue, timestamp?: number) => void;
}) => {
  const { internalValue, updateHandler } = useLinkedValue({
    value,
    onChange,
    timestamp: value.timestamp,
  });

  const isDesktop = useIsDesktop();

  const mobileTitle = useContext(DrawerMobileTitleContext);

  if (isDesktop) {
    return (
      <div className="flex gap-4">
        <Popover>
          <PopoverTrigger className="h-fit cursor-pointer">
            <ColorDisplay color={internalValue} className="h-9 w-36" />
          </PopoverTrigger>

          <PopoverContent
            side="right"
            className="box-border overflow-hidden rounded-md border border-neutral-200 bg-white p-3 text-neutral-950 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50"
          >
            <ColorPicker
              value={internalValue}
              onChange={async (v) => {
                await updateHandler(v);
              }}
              className="max-w-[300px] sm:max-w-md"
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <Drawer>
        <DrawerTrigger className="h-fit cursor-pointer">
          <ColorDisplay color={internalValue} className="h-9 w-36" />
        </DrawerTrigger>
        <DrawerContent className="p-4">
          <DrawerHeader>
            {mobileTitle && <DrawerTitle>{mobileTitle}</DrawerTitle>}
          </DrawerHeader>
          <ColorPicker
            value={internalValue}
            onChange={async (v) => {
              await updateHandler(v);
            }}
            className="sm:max-w-md"
          />
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default ColorInput;
