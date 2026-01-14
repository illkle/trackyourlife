import { RadioGroupItem } from "@radix-ui/react-radio-group";
import { cn } from "@shad/lib/utils";

import type { ITrackableZero } from "@tyl/db/client/zero-schema";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/@shad/components/card";
import { RadioGroup } from "~/@shad/components/radio-group";
import { CardPressable as Card } from "~/@shad/custom/card-pressable";
import { RenderTrackableIcon } from "~/utils/trackableIcons";

export const TrackableTypeSelector = ({
  type,
  setType,
}: {
  type: ITrackableZero["type"];
  setType: (type: ITrackableZero["type"]) => void;
}) => {
  const commonClasses =
    "border-2 transition-colors font-normal duration-200 enabled:hover:border-muted-foreground data-[state=checked]:bg-accent";

  return (
    <RadioGroup
      value={type}
      onValueChange={(v) => setType(v as ITrackableZero["type"])}
      className="grid grid-cols-1 items-stretch gap-2 sm:grid-cols-6"
    >
      <RadioGroupItem
        value="boolean"
        id="boolean"
        className={cn(commonClasses, "sm:col-span-2")}
        asChild
      >
        <Card className="text-left">
          <CardHeader>
            <RenderTrackableIcon size={20} type="boolean" />
            <CardTitle>Boolean</CardTitle>
            <CardDescription>
              True or false. Can be used for habit tracking or as a checkbox.
            </CardDescription>
          </CardHeader>
        </Card>
      </RadioGroupItem>
      <RadioGroupItem
        value="number"
        id="number"
        className={cn(commonClasses, "sm:col-span-2")}
        asChild
      >
        <Card className="text-left">
          <CardHeader>
            <RenderTrackableIcon size={20} type="number" />
            <CardTitle>Number</CardTitle>
            <CardDescription>
              Can represent count like steps walked, measurement like weight, or
              rating like mood on 1-10 scale.
            </CardDescription>
          </CardHeader>
        </Card>
      </RadioGroupItem>
      <RadioGroupItem
        value="text"
        id="text"
        className={cn(commonClasses, "sm:col-span-2")}
        asChild
      >
        <Card className="text-left">
          <CardHeader>
            <RenderTrackableIcon size={20} type="text" />
            <CardTitle>Text</CardTitle>
            <CardDescription>
              Simple block of text for each day. You can use it as a note or a
              gratitude journal.
            </CardDescription>
          </CardHeader>
        </Card>
      </RadioGroupItem>
    </RadioGroup>
  );
};
