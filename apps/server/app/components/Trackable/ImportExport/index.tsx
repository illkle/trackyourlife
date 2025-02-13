import { useCallback, useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { format, max, min } from "date-fns";
import { CheckIcon, XIcon } from "lucide-react";
import { z } from "zod";

import type {
  ITrackableRecordAttributeZero,
  ITrackableRecordZero,
  ITrackableZero,
} from "~/schema";
import { Alert, AlertDescription, AlertTitle } from "~/@shad/components/alert";
import { Button } from "~/@shad/components/button";
import { Label } from "~/@shad/components/label";
import { Separator } from "~/@shad/components/separator";
import { Spinner } from "~/@shad/components/spinner";
import { Switch } from "~/@shad/components/switch";
import DatePicker from "~/components/Inputs/DatePicker";
import { useTrackableMeta } from "~/components/Trackable/TrackableProviders/TrackableProvider";
import {
  updateAttributesRaw,
  updateValueRaw,
  useZ,
  useZeroTrackableData,
} from "~/utils/useZ";

interface DateRange {
  from?: Date;
  to?: Date;
}

/**
 * Wrapper Export component
 */
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
    value: record.value,
    date: new Date(record.date).toISOString(),
    createdAt: record.createdAt,
    trackableRecordAttributes: hasAttrbibutes
      ? record.trackableRecordAttributes
      : undefined,
  }));
};

/**
 * Component that loads data by date range and shows buttons to download export files
 */
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
      </div>
      {selectedFile && <ImportProcessor file={selectedFile} className="mt-4" />}
    </div>
  );
};

const zImportJson = z.object({
  date: z
    .string()
    .datetime()
    .transform((val) => new Date(val)),
  value: z.string(),
  createdAt: z.number().nullable().optional(),
  trackableRecordAttributes: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
        type: z.enum(["text", "number", "boolean"]),
      }),
    )
    .optional(),
});

type ImportJson = z.infer<typeof zImportJson>;

const parseJson = async (file: File) => {
  const text = await file.text();
  const data = JSON.parse(text) as unknown;

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

      const typeCheck = isValueOfExpectedType(item.value, type);

      if (!typeCheck) {
        acc.typeCheckMisses++;

        if (acc.typeCheckMissExamples.length < 3) {
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
    latestDate: info.latestDate,
    earliestDate: info.earliestDate,
  };
};

type ProcessorStatus = "idle" | "loading" | "error" | "success";

const processorStatusComponents: Record<ProcessorStatus, React.ReactNode> = {
  idle: <Spinner disabled />,
  loading: <Spinner />,
  error: <XIcon />,
  success: <CheckIcon />,
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
        setError(null);
        setState(null);
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

/**
 * Takes imported file and checks in for validitiy, shows form to confirm export
 */
const ImportProcessor = ({
  file,
  className,
}: {
  file: File;
  className?: string;
}) => {
  const { type } = useTrackableMeta();

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
        await ap(parsed, type);
      }
    },
    [type, ap, pp],
  );

  useEffect(() => {
    void fileProcessing(file);
  }, [file, fileProcessing]);

  return (
    <div className={className}>
      <div className="text-sm opacity-50">{file.name}</div>

      <div className="mt-2 flex items-center gap-2">
        {processorStatusComponents[parsing.status]}
        <div>Parsing</div>
      </div>

      {parsing.error && (
        <Alert variant="destructive" className="mt-2 w-fit">
          <AlertTitle>Parsing error</AlertTitle>
          <AlertDescription>{parsing.error.message}</AlertDescription>
        </Alert>
      )}

      <div className="mt-2">
        <div className="mt-2 flex items-center gap-2">
          {processorStatusComponents[analyzing.status]}
          <div>Analyzing</div>
        </div>
      </div>
      {analyzing.error && (
        <Alert variant="destructive" className="mt-2 w-fit">
          <AlertTitle>
            Analysis error(should not happen, likely a bug)
          </AlertTitle>
          <AlertDescription>{analyzing.error.message}</AlertDescription>
        </Alert>
      )}

      {analyzing.state && (
        <>
          {analyzing.state.typeCheckMisses > 0 && (
            <Alert variant="destructive" className="mt-2 w-fit">
              <AlertTitle>Warning: Mismatching types</AlertTitle>
              <AlertDescription>
                Encountered value
                {analyzing.state.typeCheckMisses > 1 ? "s" : ""} that do not
                match current trackable type ({type}).
                <br />
                You can still import these, but your data likely won't work as
                expected.
                <br /> <br />
                <div>
                  {analyzing.state.typeCheckMissExamples.map(
                    (example, index) => (
                      <div className="overflow-ellipsis" key={index + 1}>
                        {example}
                      </div>
                    ),
                  )}
                  {analyzing.state.typeCheckMisses >
                    analyzing.state.typeCheckMissExamples.length && (
                    <div className="text-xs opacity-50">
                      +{" "}
                      {analyzing.state.typeCheckMisses -
                        analyzing.state.typeCheckMissExamples.length}{" "}
                      more...
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-2">
            <div className="flex flex-wrap gap-3">
              <div>Records: {analyzing.state.itemsCount}</div>
              {analyzing.state.hasAttrbibutes && (
                <div>Attributes: {analyzing.state.attributesCount}</div>
              )}
            </div>
          </div>
        </>
      )}

      {parsing.state && analyzing.state && (
        <ImportForm parse={parsing.state} analysis={analyzing.state} />
      )}
    </div>
  );
};

/**
 * Form that confirms already validated export
 */
const ImportForm = ({
  parse,
  analysis,
}: {
  parse: Awaited<ReturnType<typeof parseJson>>;
  analysis: Awaited<ReturnType<typeof analyzeData>>;
}) => {
  const { type, id: trackableId } = useTrackableMeta();

  const z = useZ();

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const form = useForm<{
    from: Date;
    to: Date;
  }>({
    defaultValues: {
      from: analysis.earliestDate,
      to: analysis.latestDate,
    },
    onSubmit: async (formData) => {
      try {
        const withinRange = parse.filter((item) => {
          return (
            item.date >= formData.value.from && item.date <= formData.value.to
          );
        });

        // TODO: make promise all(this is quite fast already though)
        for (const item of withinRange) {
          const id = await updateValueRaw(
            z,
            trackableId,
            item.date,
            type,
            item.value,
            undefined,
            item.createdAt ?? undefined,
          );

          if (item.trackableRecordAttributes) {
            await updateAttributesRaw(
              z,
              trackableId,
              id,
              item.trackableRecordAttributes,
            );
          }
        }
        setSuccess(true);
      } catch (error) {
        setError(error as Error);
      }
    },
  });

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
                        start: analysis.earliestDate,
                        end: min([analysis.latestDate, state.to]),
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
                        start: max([analysis.earliestDate, state.from]),
                        end: analysis.latestDate,
                      }}
                    />
                  );
                }}
              />
            )}
          />
        </div>

        <Button
          isLoading={form.state.isSubmitting}
          disabled={form.state.isSubmitting || form.state.isSubmitted}
          variant={"outline"}
          type="submit"
        >
          Import
        </Button>
      </form>

      {success && (
        <Alert className="mt-2 w-fit">
          <AlertTitle>Done</AlertTitle>
          <AlertDescription>Data imported successfully</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mt-2 w-fit">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
