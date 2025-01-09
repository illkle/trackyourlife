import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";

import TrackableView from "~/components/TrackableView";
import {
  usePreloadTrackableMonthView,
  usePreloadTrackableYearView,
} from "~/utils/useZ";

export const Route = createFileRoute("/app/trackables/$id/view")({
  component: RouteComponent,
});

const PreloaderMonth = ({
  year,
  children,
}: {
  year: number;
  children: React.ReactNode;
}) => {
  const params = Route.useParams();
  usePreloadTrackableMonthView({
    id: params.id,
    year: year,
  });

  return children;
};

const PreloaderYear = ({
  year,
  children,
}: {
  year: number;
  children: React.ReactNode;
}) => {
  const params = Route.useParams();
  usePreloadTrackableYearView({
    id: params.id,
    year: year,
  });

  return children;
};

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { month, year } = Route.useSearch();

  if (typeof year === "number" && typeof month === "number") {
    return (
      <PreloaderMonth year={year}>
        <TrackableView
          month={month}
          year={year}
          setDates={(y, m) => {
            void navigate({
              search: (prev) => ({ ...prev, year: y, month: m }),
            });
          }}
        />
      </PreloaderMonth>
    );
  } else if (typeof year === "number") {
    return (
      <PreloaderYear year={year}>
        <TrackableView
          month={month}
          year={year}
          setDates={(y, m) => {
            void navigate({
              search: (prev) => ({ ...prev, year: y, month: m }),
            });
          }}
        />
      </PreloaderYear>
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
