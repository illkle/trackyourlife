import { useCallback } from "react";

import { Textarea } from "~/@shad/components/textarea";
import { useDayCellContext } from "~/components/DayCell";
import { useLinkedValue } from "~/utils/useDbLinkedValue";

export const DayCellText = () => {
  const { values, onChange } = useDayCellContext();
  const { value, recordId, updatedAt } = values[0] ?? {};

  const changeHandler = useCallback(
    (v: string, ts: number) => {
      void onChange({ value: v, recordId, updatedAt: ts });
    },
    [onChange, recordId],
  );

  const { internalValue, updateHandler, flush } = useLinkedValue({
    value: value ?? "",
    timestamp: updatedAt ?? undefined,
    onChange: changeHandler,
  });

  return (
    <div className="h-full w-full flex-col overflow-y-scroll rounded-xs border-2 border-neutral-200 text-sm dark:border-neutral-900">
      <Textarea
        autoFocus
        value={internalValue}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.shiftKey) {
            e.preventDefault();

            if (e.target instanceof HTMLTextAreaElement) {
              e.target.blur();
            }
          }
        }}
        onChange={async (e) => {
          await updateHandler(e.target.value);
        }}
        onBlur={() => {
          flush();
        }}
        className="m-1"
      />
    </div>
  );
};
