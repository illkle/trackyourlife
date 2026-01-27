import { createFileRoute } from "@tanstack/react-router";

import { MonthView, YearView } from "~/components/Trackable/TrackableView";
import { useMonthYear } from "~/routes/app/trackables/$id";
import { ViewController } from "~/components/Trackable/TrackableView/viewController";

export const Route = createFileRoute("/app/trackables/$id/view")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { month, year } = Route.useSearch();

  const { mode, from } = useMonthYear();

  return (
    <>
      <ViewController year={year} month={month} />
      {mode === "month" && <MonthView date={from} />}
      {mode === "year" && (
        <YearView
          date={from}
          openMonth={(m) => {
            void navigate({
              search: (prev) => ({ ...prev, year: year, month: m }),
            });
          }}
        />
      )}
      <hr className="my-4 h-px border-none bg-muted-foreground opacity-10 outline-hidden" />
    </>
  );
}
