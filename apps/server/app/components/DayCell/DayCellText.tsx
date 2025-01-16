import { LazyTextEditor } from "~/components/LazyTextEditor";
import { useRecordUpdateHandler } from "~/utils/useZ";

export const DayCellTextEditor = ({
  value,
  createdAt,
  recordId,
  date,
}: {
  recordId?: string;
  date: Date;
  value?: string;
  createdAt?: number | null;
  className?: string;
}) => {
  const onChange = useRecordUpdateHandler(date, recordId);

  return (
    <div className="h-full" key={date.toISOString()}>
      <LazyTextEditor
        content={value ?? ""}
        contentTimestamp={createdAt ?? 0}
        updateContent={(v, t) => onChange(v, t)}
      />
    </div>
  );
};
