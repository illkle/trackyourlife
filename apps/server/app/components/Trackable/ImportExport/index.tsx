import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";

import type {
  ITrackableRecordAttributeZero,
  ITrackableRecordZero,
} from "~/schema";
import { Button } from "~/@shad/components/button";
import { Separator } from "~/@shad/components/separator";
import { Spinner } from "~/@shad/components/spinner";
import DatePicker from "~/components/Inputs/DatePicker";
import { useTrackableMeta } from "~/components/Trackable/TrackableProviders/TrackableProvider";
import { useZeroTrackableData } from "~/utils/useZ";

interface DateRange {
  from?: Date;
  to?: Date;
}

export const ExportTrackable = ({ id }: { id: string }) => {
  const form = useForm<DateRange>({
    defaultValues: {
      from: undefined,
      to: undefined,
    },
    onSubmit: (data) => {
      setSelected(data.value);
    },
  });

  const [selected, setSelected] = useState<DateRange | null>(null);

  return (
    <div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await form.handleSubmit();
        }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end"
      >
        <div>
          <h4 className="mb-1">From</h4>
          <form.Subscribe
            selector={(state) => ({
              to: state.values.to,
            })}
            children={(state) => (
              <form.Field
                name="from"
                children={(field) => {
                  return (
                    <DatePicker
                      date={field.state.value}
                      onChange={(date) => field.handleChange(date)}
                      limits={{
                        start: new Date(1970, 0, 1),
                        end: state.to ?? new Date(),
                      }}
                    />
                  );
                }}
              />
            )}
          />
        </div>
        <div>
          <h4 className="mb-1">To</h4>
          <form.Subscribe
            selector={(state) => ({
              from: state.values.from,
            })}
            children={(state) => (
              <form.Field
                name="to"
                children={(field) => {
                  return (
                    <DatePicker
                      date={field.state.value}
                      onChange={(date) => field.handleChange(date)}
                      limits={{
                        start: state.from ?? new Date(1970, 0, 1),
                        end: new Date(),
                      }}
                    />
                  );
                }}
              />
            )}
          />
        </div>

        <Button variant={"outline"} type="submit">
          Load
        </Button>
      </form>

      {selected && (
        <>
          <Separator className="my-4" />
          <ExportLoader selected={selected} />
        </>
      )}
    </div>
  );
};

type ExportRecords = ITrackableRecordZero & {
  readonly trackableRecordAttributes: readonly ITrackableRecordAttributeZero[];
};

const dataToExportFormat = (data: readonly ExportRecords[]) => {
  return data.map((record) => ({
    ...record,
    user_id: undefined,
    trackableId: undefined,
  }));
};

const ExportLoader = ({ selected }: { selected: DateRange }) => {
  const { id } = useTrackableMeta();

  const [data, status] = useZeroTrackableData({
    id,
    firstDay: selected.from?.getTime() ?? new Date(1970, 0, 1).getTime(),
    lastDay: selected.to?.getTime() ?? new Date().getTime(),
  });

  if (status.type !== "complete") {
    return (
      <div className="flex items-center gap-1">
        <Spinner /> {data.length} records loaded
      </div>
    );
  }

  const exportDataAsJson = () => {
    const stripped = dataToExportFormat(data);
    const jsonString = JSON.stringify(stripped, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `trackable-export-${format(new Date(), "yyyy-MM-dd HH:mm:ss")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportDataAsCsv = () => {
    // First collect all possible attribute keys
    const attributeKeys = new Set<string>();
    data.forEach((record) => {
      record.trackableRecordAttributes.forEach((attr) => {
        attributeKeys.add(attr.key);
      });
    });

    // Base columns (excluding attributes)
    const baseColumns: (keyof ExportRecords)[] = [
      "date",
      "value",
      "recordId",
      "createdAt",
    ];
    const allColumns = [...baseColumns, ...Array.from(attributeKeys)];
    const header = allColumns.join(",");

    const rows = data.map((record) => {
      const attributesMap = Object.fromEntries(
        record.trackableRecordAttributes.map((attr) => [attr.key, attr.value]),
      );

      const rowValues = allColumns.map((column) => {
        if (baseColumns.includes(column as keyof ExportRecords)) {
          return record[column as keyof ExportRecords];
        }

        const attrValue = attributesMap[column];

        return attrValue ?? "";
      });

      return rowValues.join(",");
    });

    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `trackable-export-${format(new Date(), "yyyy-MM-dd HH:mm:ss")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="gap-2">
      {format(selected.from ?? new Date(1970, 0, 1), "dd MMMM yyyy")} —{" "}
      {format(selected.to ?? new Date(), "dd MMMM yyyy")}
      <span className="ml-2 text-sm opacity-30">({data.length} records)</span>
      <div className="mt-2 flex gap-2">
        <Button variant="outline" onClick={exportDataAsJson}>
          JSON
        </Button>
        <Button variant="outline" onClick={exportDataAsCsv}>
          CSV
        </Button>{" "}
      </div>
    </div>
  );
};

export const Import = () => {
  return <div>TODO</div>;
};
