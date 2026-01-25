import { useCallback } from "react";

import type { PopupEditorProps } from "~/components/PopupEditor";
import { Textarea } from "~/@shad/components/textarea";
import { closeDayEditor } from "~/components/Modal/EditorModalV2";
import { useLinkedValue } from "@tyl/helpers/useDbLinkedValue";

export const TextPopupEditor = ({ data, onChange }: PopupEditorProps) => {
  const { value, id: recordId, updated_at: updatedAt } = data[0] ?? {};

  const changeHandler = useCallback(
    (v: string, ts: number) => {
      void onChange({ value: v, recordId, updatedAt: ts });
    },
    [onChange, recordId],
  );

  const { internalValue, updateHandler } = useLinkedValue({
    value: value ?? "",
    timestamp: updatedAt ?? undefined,
    onChange: changeHandler,
  });

  return (
    <div className="flex items-stretch gap-1">
      <div className="flex grow">
        <Textarea
          autoFocus
          value={internalValue}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) {
              e.preventDefault();
              closeDayEditor();
            }
          }}
          onChange={async (e) => {
            await updateHandler(e.target.value);
          }}
          onBlur={() => {
            closeDayEditor();
          }}
          className="m-1"
        />
      </div>
    </div>
  );
};
