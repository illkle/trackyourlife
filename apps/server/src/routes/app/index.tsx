import { createFileRoute } from "@tanstack/react-router";
import { subDays } from "date-fns";
import { TrackableDataProvider } from "@tyl/helpers/data/TrackableDataProvider";
import { TrackableFlagsProvider } from "@tyl/helpers/data/TrackableFlagsProvider";
import { useNowDay } from "@tyl/helpers/date/clockStore";

import { DailyList } from "~/components/Trackable/TrackablesList";

const SHOW_DAYS = 7;

export const Route = createFileRoute("/app/")({
  component: AppComponent,
});

function AppComponent() {
  const today = useNowDay();
  const firstShown = subDays(today, SHOW_DAYS);

  return (
    <TrackableFlagsProvider>
      <TrackableDataProvider firstDay={firstShown} lastDay={today}>
        <div className="content-container flex w-full flex-col pb-6">
          <DailyList daysToShow={SHOW_DAYS} />
        </div>
      </TrackableDataProvider>
    </TrackableFlagsProvider>
  );
}
