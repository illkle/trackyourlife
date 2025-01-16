import { createFileRoute } from "@tanstack/react-router";

import { SettingsTitle } from "~/components/CreateAndSettingsFlows";
import { Import } from "~/components/ImportExport";

export const Route = createFileRoute("/app/trackables/$id/import")({
  component: RouteComponent,
});

const FormatExample = `{
  "type": "number",
  "data": [
    {
      "date": "2024-01-31", 
      "value": 10
    }
  ]
}`;

function RouteComponent() {
  return (
    <div>
      <SettingsTitle>Import</SettingsTitle>

      <Import />

      <SettingsTitle>Format</SettingsTitle>

      <div className="grid grid-cols-2 grid-rows-[auto_1fr] gap-2 gap-x-8 max-sm:grid-cols-1">
        <pre className="row-span-2 mt-2 rounded-md border p-2 dark:border-neutral-700 dark:bg-neutral-800">
          {FormatExample}
        </pre>
        <p className="mt-2 max-sm:row-start-1">
          If you are parsing and transforming your own data, use the following
          format.
        </p>

        <p className="mt-2 text-sm text-neutral-800 dark:text-neutral-400">
          Types are <span className="font-mono">boolean</span>,{" "}
          <span className="font-mono">number</span>, and{" "}
          <span className="font-mono">range</span>.
          <br />
          Value must be boolean, number and string respectively. <br />
          Date is <span className="font-mono">yyyy-MM-dd</span> parsed with{" "}
          <a
            href="https://date-fns.org/v4.1.0/docs/parse"
            target="_blank"
            className="font-mono underline"
          >
            date-fns
          </a>
          .
        </p>
      </div>
    </div>
  );
}
