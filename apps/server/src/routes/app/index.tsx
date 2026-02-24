import { createFileRoute } from "@tanstack/react-router";
import { subDays } from "date-fns";
import { TrackableDataProvider } from "@tyl/helpers/data/TrackableDataProvider";

import { DailyList } from "~/components/Trackable/TrackablesList";

const SHOW_DAYS = 7;

export const Route = createFileRoute("/app/")({
  component: AppComponent,
});

function AppComponent() {
  const today = new Date();
  const firstShown = subDays(today, SHOW_DAYS);

  return (
    <TrackableDataProvider firstDay={firstShown} lastDay={today}>
      <div className="content-container flex w-full flex-col pb-6">
        <DailyList daysToShow={SHOW_DAYS} />
      </div>
    </TrackableDataProvider>
  );
}
