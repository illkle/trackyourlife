import { useCallback, useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { z } from "zod";

import type {
  ITrackableRecordAttributeZero,
  ITrackableRecordZero,
  ITrackableZero,
} from "~/schema";
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

export const ExportTrackable = () => {
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

const dataToExportFormat = (
  data: readonly ExportRecords[],
  type: ITrackableZero["type"],
) => {
  const attrTypes = ["tags", "text"] as ITrackableZero["type"][];

  const hasAttrbibutes = attrTypes.includes(type);

  return data.map((record) => ({
    ...record,
    date: new Date(record.date).toISOString(),
    user_id: undefined,
    trackableId: undefined,
    trackableRecordAttributes: hasAttrbibutes
      ? record.trackableRecordAttributes
      : undefined,
  }));
};

const ExportLoader = ({ selected }: { selected: DateRange }) => {
  const { id, type } = useTrackableMeta();

  const [data, status] = useZeroTrackableData({
    id,
    firstDay: selected.from?.getTime() ?? new Date(1970, 0, 1).getTime(),
    lastDay: selected.to?.getTime() ?? new Date().getTime(),
  });

  const [exportInternalFields, setExportInternalFields] = useState(true);

  const exportDataAsJson = () => {
    const stripped = dataToExportFormat(data, type);
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

  if (status.type !== "complete") {
    return (
      <div className="flex items-center gap-1">
        <Spinner /> {data.length} records loaded {status.type}
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
        <Button variant="outline" onClick={exportDataAsCsv}>
          CSV
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

export const Import = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileImport = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setSelectedFile(file);
      event.target.value = "";
    },
    [],
  );

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative">
          <input
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          <Button variant="outline">JSON</Button>
        </div>
        <div className="relative">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileImport}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          <Button variant="outline">CSV</Button>
        </div>
      </div>
      {selectedFile && <ImportProcessor file={selectedFile} />}
    </div>
  );
};

const zImportJson = z.object({
  date: z
    .string()
    .datetime()
    .transform((val) => new Date(val)),
  value: z.string(),
  recordId: z.string().optional(),
  createdAt: z.number().optional(),
  trackableRecordAttributes: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
      }),
    )
    .optional(),
});

type ImportJson = z.infer<typeof zImportJson>;

const parseJson = async (file: File) => {
  const text = await file.text();
  const data = JSON.parse(text) as unknown;
  console.log(data);
  const parsed = z.array(zImportJson).parse(data);

  return parsed;
};

const isValueOfExpectedType = (value: string, type: ITrackableZero["type"]) => {
  if (type === "boolean") {
    return value === "true" || value === "false" || value.length === 0;
  }

  if (type === "number") {
    return !isNaN(Number(value));
  }

  return true;
};

const analyzeData = (data: ImportJson[], type: ITrackableZero["type"]) => {
  const itemsCount = data.length;

  const firstOne = data[0];

  if (!firstOne) throw new Error("Empty file passed");

  const hasAttrbibutes = firstOne.trackableRecordAttributes !== undefined;

  const info = data.reduce(
    (acc, item) => {
      if (hasAttrbibutes) {
        acc.attributesCount += item.trackableRecordAttributes?.length ?? 0;
      }

      if (!acc.earliestDate || item.date < acc.earliestDate) {
        acc.earliestDate = item.date;
      }

      if (!acc.latestDate || item.date > acc.latestDate) {
        acc.latestDate = item.date;
      }

      if (!item.recordId) {
        acc.recordIdPresent = false;
      }

      const typeCheck = isValueOfExpectedType(item.value, type);

      if (!typeCheck) {
        acc.typeCheckMisses++;

        if (acc.typeCheckMissExamples.length < 5) {
          acc.typeCheckMissExamples.push(item.value);
        }
      }

      return acc;
    },
    {
      attributesCount: 0,
      earliestDate: undefined as Date | undefined,
      latestDate: undefined as Date | undefined,
      typeCheckMisses: 0,
      typeCheckMissExamples: [] as string[],
      recordIdPresent: true,
    },
  );

  if (!info.earliestDate || !info.latestDate) {
    throw new Error(
      "Something went wrong with date parsing, please report bug",
    );
  }

  return {
    ...info,
    hasAttrbibutes,
    itemsCount,
  };
};

const useProcessor = <T, A extends unknown[]>(
  fn: (...args: A) => T | Promise<T>,
) => {
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");

  const [error, setError] = useState<Error | null>(null);
  const [state, setState] = useState<T | null>(null);

  const process = useCallback(
    async (...args: A) => {
      try {
        setStatus("loading");
        const res = await fn(...args);
        setState(res);
        setStatus("success");
        return res;
      } catch (error) {
        setStatus("error");
        setError(error as Error);
      }
      return null;
    },
    [fn],
  );

  return { status, error, state, process };
};

const ImportProcessor = ({ file }: { file: File }) => {
  const [data, setData] = useState<ExportRecords[]>([]);

  const { id, type } = useTrackableMeta();

  const parsing = useProcessor(parseJson);
  const analyzing = useProcessor(analyzeData);

  // To keep useCallback dependencies clean without spreading parsing and analyzing
  const pp = parsing.process;
  const ap = analyzing.process;

  const fileProcessing = useCallback(
    async (file: File) => {
      if (file.type === "application/json") {
        const parsed = await pp(file);
        if (!parsed) return;
        const analyzed = await ap(parsed, type);
      }
    },
    [type, ap, pp],
  );

  useEffect(() => {
    void fileProcessing(file);
  }, [file, fileProcessing]);

  const [importSettings, setImportSettings] = useState<{
    priority: "import" | "existing";
  }>({
    priority: "existing",
  });

  return (
    <div>
      <div>
        <h4>Parsing</h4>
        <p>{parsing.status}</p>
        {parsing.error && <p>{parsing.error.message}</p>}
      </div>

      <div>
        <h4>Analyzing</h4>
        <p>{analyzing.status}</p>
        {analyzing.error && <p>{analyzing.error.message}</p>}

        {analyzing.state && <div>{JSON.stringify(analyzing.state)}</div>}
      </div>
    </div>
  );
};
