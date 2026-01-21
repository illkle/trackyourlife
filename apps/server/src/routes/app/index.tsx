import { createFileRoute } from "@tanstack/react-router";

import { DailyList } from "~/components/Trackable/TrackablesList";

const SHOW_DAYS = 7;

export const Route = createFileRoute("/app/")({
  component: AppComponent,
});

function AppComponent() {
  return (
    <div className="content-container flex w-full flex-col pb-6">
      <DailyList daysToShow={SHOW_DAYS} />
    </div>
  );
}
