import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";

import TrackableView from "~/components/Trackable/TrackableView";

export const Route = createFileRoute("/app/trackables/$id/view")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { month, year } = Route.useSearch();

  if (typeof year === "number" && typeof month === "number") {
    return (
      <TrackableView
        month={month}
        year={year}
        setDates={(y, m) => {
          void navigate({
            search: (prev) => ({ ...prev, year: y, month: m }),
          });
        }}
      />
    );
  } else if (typeof year === "number") {
    return (
      <TrackableView
        month={month}
        year={year}
        setDates={(y, m) => {
          void navigate({
            search: (prev) => ({ ...prev, year: y, month: m }),
          });
        }}
      />
    );
  } else {
    // todo when years view is awailable
  }

  return (
    <TrackableView
      month={month}
      year={year}
      setDates={(y, m) => {
        void navigate({
          search: (prev) => ({ ...prev, year: y, month: m }),
        });
      }}
    />
  );
}
