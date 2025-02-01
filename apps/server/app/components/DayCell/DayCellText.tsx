import { useDayCellContext } from "~/components/DayCell";
import { LazyTextEditor } from "~/components/Inputs/LazyTextEditor";

export const DayCellText = () => {
  const { values, onChange, date } = useDayCellContext();

  const { value, recordId, createdAt } = values[0] ?? {};

  return (
    <div className="h-full w-full flex-col overflow-y-scroll rounded-xs border-2 border-neutral-200 text-sm dark:border-neutral-900">
      <LazyTextEditor
        debug={date.getDate() === 1}
        content={value ?? ""}
        contentTimestamp={createdAt ?? 0}
        updateContent={(content, ts) => onChange(content, recordId, ts)}
        className="h-full p-1"
      ></LazyTextEditor>
    </div>
  );
};
