import { createFileRoute } from "@tanstack/react-router";

import { IngestKeysManager } from "~/components/Trackable/ApiKeys";
import { ExportTrackable, Import } from "~/components/Trackable/ImportExport";
import { SettingsTitle } from "~/components/Trackable/Settings/settingsTitle";

export const Route = createFileRoute("/app/trackables/$id/import")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <SettingsTitle>Export</SettingsTitle>

      <ExportTrackable />

      <SettingsTitle>Import</SettingsTitle>

      <Import />

      <SettingsTitle>Format</SettingsTitle>

      <SettingsTitle>Ingest API key</SettingsTitle>

      <IngestKeysManager />
    </div>
  );
}
