import { useCallback, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Check } from "lucide-react";

import type { ITrackableRecordZero } from "@tyl/db/client/zero-schema";
import { Button } from "~/@shad/components/button";
import { Label } from "~/@shad/components/label";
import { Separator } from "~/@shad/components/separator";
import { Spinner } from "~/@shad/components/spinner";
import { Switch } from "~/@shad/components/switch";
import DatePicker from "~/components/Inputs/DatePicker";
import { useTrackableMeta } from "~/components/Trackable/TrackableProviders/TrackableProvider";
import { useZeroTrackableData } from "~/utils/useZ";

interface DateRange {
  from?: Date;
  to?: Date;
}

/**
 * Wrapper Export component
 */
export const ExportTrackable = () => {
  const form = useForm({
    defaultValues: {
      from: undefined,
      to: undefined,
    } as DateRange,
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

const dataToExportFormat = (data: readonly ITrackableRecordZero[]) => {
  return data.map((record) => ({
    value: record.value,
    date: new Date(record.date).toISOString(),
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }));
};

/**
 * Component that loads data by date range and shows buttons to download export files
 */
const ExportLoader = ({ selected }: { selected: DateRange }) => {
  const { id } = useTrackableMeta();

  const [data, status] = useZeroTrackableData({
    id,
    firstDay: selected.from?.getTime() ?? new Date(1970, 0, 1).getTime(),
    lastDay: selected.to?.getTime() ?? new Date().getTime(),
  });

  const [exportInternalFields, setExportInternalFields] = useState(true);

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

  if (status.type !== "complete") {
    return (
      <div className="flex items-center gap-1">
        <Spinner /> Collecting data...
      </div>
    );
  }

  return (
    <div className="gap-2">
      {format(selected.from ?? new Date(1970, 0, 1), "dd MMMM yyyy")} —{" "}
      {format(selected.to ?? new Date(), "dd MMMM yyyy")}
      <span className="ml-2 text-sm opacity-30">({data.length} records)</span>
      <div className="mt-2 flex items-center gap-2">
        <Button variant="outline" onClick={exportDataAsJson}>
          JSON
        </Button>

        <Switch
          id="export-internal-field"
          checked={exportInternalFields}
          onCheckedChange={setExportInternalFields}
        />
        <Label htmlFor="export-internal-field" className="flex flex-col gap-1">
          Export internal fields
          <span className="text-xs opacity-50">
            Useful if you intend to reimport into TYL, but larger file size.
          </span>
        </Label>
      </div>
    </div>
  );
};

/**
 * Import wrapper component
 */
export const Import = () => {
  const { id } = useTrackableMeta();

  const { mutateAsync, isPending, isSuccess, data } = useMutation({
    mutationFn: async (file: File) => {
      const t = await file.text();

      const res = await fetch("/api/ingest/v1/json", {
        method: "PUT",
        body: t,
        headers: {
          "Content-Type": "text/plain",
          // Flags to check auth against cookies instead of API key
          "x-authed-user": "true",
          "x-authed-trackable": id,
        },
      });

      const json = (await res.json()) as unknown as {
        inserted: number;
        updated: number;
        success: boolean;
      };

      return json;
    },
  });

  const handleFileImport = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      await mutateAsync(file);
    },
    [mutateAsync],
  );

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex items-center gap-2">
          <input
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          <Button variant="outline">JSON</Button>

          {isPending ? (
            <span className="ml-2 flex items-center gap-1">
              <Spinner /> importing...
            </span>
          ) : isSuccess ? (
            <span className="ml-2 flex items-center gap-1">
              <Check /> Done: {data.inserted} inserted, {data.updated} updated
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};
