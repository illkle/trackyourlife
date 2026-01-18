import { cn } from "@shad/lib/utils";

import type { PopupEditorProps } from "~/components/PopupEditor";
import { NumberInput, NumberInputWrapper } from "~/components/DayCell/DayCellNumber";
import { closeDayEditor } from "~/components/Modal/EditorModalV2";

export const NumberPopupEditor = ({ data, onChange }: PopupEditorProps) => {
  const { value, recordId, updatedAt } = data.values[0] ?? {};

  return (
    <div className="flex items-stretch gap-2">
      <NumberInputWrapper
        className="w-full"
        value={value}
        updateTimestamp={updatedAt ?? undefined}
        onChange={async (v, ts) => {
          await onChange({ value: v, recordId, updatedAt: ts });
        }}
      >
        <NumberInput
          autoFocus
          onBlur={() => {
            closeDayEditor();
          }}
          className={cn(
            "relative z-10 flex h-full w-full items-center justify-center rounded-sm bg-inherit text-center font-semibold outline-hidden transition-all select-none",
            "text-2xl",
            "h-20 focus:outline-ring",
          )}
        />
      </NumberInputWrapper>
    </div>
  );
};
