import { useState } from "react";
import { format, parse } from "date-fns";
import { FileIcon } from "lucide-react";

import { generateSimpleHash } from "@tyl/helpers";

import type { IImportJson } from "~/components/Trackable/ImportExport/importLogic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/@shad/components/card";

const cleanup = (str: string) => {
  return str.replace(/"/g, "");
};

const strongProcessor = async (file: File) => {
  const text = await file.text();

  const [headers, ...rows] = text.split("\n");

  if (!headers) {
    throw new Error("No headers found");
  }

  const headersArray = headers.split(",");

  const headersObject = headersArray.reduce(
    (acc, header, index) => {
      acc[header] = index;
      return acc;
    },
    {} as Record<string, number>,
  ) as Record<
    | "Date"
    | "Workout Name"
    | "Exercise Name"
    | "Set Order"
    | "Weight"
    | "Reps"
    | "RPE",
    number
  >;

  for (const expected of [
    "Date",
    "Workout Name",
    "Exercise Name",
    "Set Order",
    "Weight",
    "Reps",
    "RPE",
  ]) {
    // @ts-expect-error - This is a hack to get the type to work
    if (typeof headersObject[expected] !== "number") {
      throw new Error(`${expected} not found`);
    }
  }

  const rowsArray = rows.map((row) => row.split(","));

  if (!rowsArray.length) {
    throw new Error("No rows found");
  }

  const result: IImportJson[] = [];

  for (const row of rowsArray) {
    const d = row[headersObject.Date];

    if (!d) {
      continue;
    }

    // 2020-01-20 19:53:51
    const date = parse(
      row[headersObject.Date] ?? "",
      "yyyy-MM-dd HH:mm:ss",
      new Date(),
    );

    result.push({
      date,
      value: cleanup(row[headersObject["Exercise Name"]] ?? ""),
      externalKey: generateSimpleHash(
        [
          row[headersObject.Date],
          row[headersObject["Workout Name"]],
          row[headersObject["Exercise Name"]],
          row[headersObject["Set Order"]],
        ].join(""),
      ),
      attrbites: {
        weight: cleanup(row[headersObject.Weight] ?? ""),
        reps: cleanup(row[headersObject.Reps] ?? ""),
        rpe: cleanup(row[headersObject.RPE] ?? ""),
        set_order: cleanup(row[headersObject["Set Order"]] ?? ""),
      },
    });
  }

  return result;
};

const downloadJson = (data: unknown, filename: string) => {
  const jsonData = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const StrongConverter = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);

      const processed = await strongProcessor(selectedFile);
      downloadJson(
        processed,
        selectedFile.name +
          "-processed-" +
          format(new Date(), "yyyy-MM-dd HH:mm"),
      );
    }
  };

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Strong App CSV</CardTitle>
        <CardDescription>
          <a href="https://www.strong.app/" target="_blank">
            https://www.strong.app/
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-4">
          <label
            htmlFor="csvFile"
            className="border-border hover:bg-muted flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FileIcon className="text-muted-foreground mb-2 h-8 w-8" />
              <p className="text-muted-foreground text-sm">
                {file ? file.name : "Click to upload CSV file"}
              </p>
            </div>
            <input
              id="csvFile"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        </div>
      </CardContent>
    </Card>
  );
};
