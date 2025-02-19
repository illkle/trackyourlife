import type { PopupEditorProps } from "~/components/PopupEditor";
import { cn } from "~/@shad/utils";
import {
  NumberInput,
  NumberInputWrapper,
} from "~/components/DayCell/DayCellNumber";
import { closeDayEditor } from "~/components/Modal/EditorModalV2";

export const NumberPopupEditor = ({ data, onChange }: PopupEditorProps) => {
  const { value, recordId, createdAt } = data.values[0] ?? {};

  return (
    <div className="flex items-stretch gap-2">
      <NumberInputWrapper
        className="w-full"
        value={value}
        updateTimestamp={createdAt ?? undefined}
        onChange={async (v, ts) => {
          await onChange(v, recordId, ts);
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
            "h-20 focus:outline-neutral-300 dark:focus:outline-neutral-600",
          )}
        />
      </NumberInputWrapper>
    </div>
  );
};
