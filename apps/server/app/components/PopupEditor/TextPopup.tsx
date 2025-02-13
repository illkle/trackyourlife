import { useRef, useState } from "react";
import { CornerRightUp } from "lucide-react";

import { Button } from "~/@shad/components/button";
import { Textarea } from "~/@shad/components/textarea";
import type { PopupEditorProps } from "~/components/PopupEditor";

export const TextPopupEditor = ({ data, onChange }: PopupEditorProps) => {
  const { value, recordId } = data.values[0] ?? {};

  const [isEdited, setIsEdited] = useState(false);

  const valueRef = useRef(value ?? "");

  return (
    <div className="flex items-stretch gap-2">
      <div className="flex grow">
        <Textarea
          autoFocus
          defaultValue={value ?? ""}
          onChange={(e) => {
            if (!isEdited) {
              setIsEdited(true);
            }
            valueRef.current = e.target.value;
          }}
          className="m-1"
        />
      </div>
      <Button
        className="h-[unset]"
        disabled={!isEdited}
        variant={"outline"}
        onClick={async () => {
          await onChange(valueRef.current, recordId, Date.now());
          setIsEdited(false);
        }}
      >
        <CornerRightUp size={16} />
      </Button>
    </div>
  );
};
