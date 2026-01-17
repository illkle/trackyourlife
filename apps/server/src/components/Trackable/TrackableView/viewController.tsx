import { useEffect, useState } from "react";
import { cn } from "@shad/lib/utils";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import type { TVDateValue } from "~/components/Trackable/TrackableView";
import { Button } from "~/@shad/components/button";
import { YearSelector } from "~/components/Trackable/TrackableView/yearSelector";
import { Route } from "~/routes/app/trackables/$id/view";

const getIncrementedDate = (
  add: number,
  year: TVDateValue,
  month: TVDateValue,
) => {
  if (month === "list" && year !== "list") {
    return { year: year + add, month: month };
  }

  if (month === "list" || year === "list") {
    return { year, month };
  }

  let newMonth = month + add;
  let newYear = year;
  if (newMonth < 0) {
    newMonth = 11;
    newYear = year - 1;
  }

  if (newMonth > 11) {
    newMonth = 0;
    newYear = year + 1;
  }
  return { year: newYear, month: newMonth };
};

export const ViewController = ({
  year,
  month,
}: {
  year: TVDateValue;
  month: TVDateValue;
}) => {
  const now = new Date();
  const navigate = Route.useNavigate();

  const toPrev = getIncrementedDate(-1, year, month);
  const toNext = getIncrementedDate(1, year, month);

  const toPrevYear = getIncrementedDate(-12, year, month);
  const toNextYear = getIncrementedDate(12, year, month);

  const toToday = {
    year: now.getFullYear(),
    month: now.getMonth(),
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.shiftKey) {
          setSwitchingYears(true);
          if (e.key === "ArrowLeft" || e.code === "KeyA") {
            void navigate({ search: (prev) => ({ ...prev, ...toPrevYear }) });
          } else if (e.key === "ArrowRight" || e.code === "KeyD") {
            void navigate({ search: (prev) => ({ ...prev, ...toNextYear }) });
          }
        } else {
          if (e.key === "ArrowLeft" || e.code === "KeyA") {
            void navigate({ search: (prev) => ({ ...prev, ...toPrev }) });
          } else if (e.key === "ArrowRight" || e.code === "KeyD") {
            void navigate({ search: (prev) => ({ ...prev, ...toNext }) });
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setSwitchingYears(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [navigate, toPrev, toNext, toPrevYear, toNextYear]);

  const [switchingYears, setSwitchingYears] = useState(false);

  return (
    <>
      <div
        className={cn(
          "border-sidebar-border group mb-4 ml-auto flex w-fit items-center rounded-md border",
        )}
      >
        <Button
          aria-label="Previous month"
          variant="ghost"
          size="icon"
          render={
            switchingYears ? (
              <Link
                from={Route.fullPath}
                search={(prev) => ({ ...prev, ...toPrevYear })}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                from={Route.fullPath}
                search={(prev) => ({ ...prev, ...toPrev })}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Link>
            )
          }
          className="rounded-sm"
        />

        <div className="flex items-center justify-center">
          <YearSelector
            value={typeof year === "number" ? year : undefined}
            onChange={(v) =>
              navigate({ search: (prev) => ({ ...prev, year: v }) })
            }
            className={"opacity-50 focus:opacity-100"}
          />

          {typeof year === "number" && typeof month === "number" && (
            <>
              <Link
                from={Route.fullPath}
                search={(prev) => ({
                  ...prev,
                  month: "list",
                })}
                className={cn(
                  switchingYears ? "opacity-50" : "opacity-100",
                  "p-2 leading-none",
                )}
              >
                <Button
                  name="months"
                  variant="link"
                  className="h-auto w-full min-w-20 shrink-0 p-0"
                >
                  {format(new Date(year, month, 1), "MMMM")}
                </Button>
              </Link>
            </>
          )}
        </div>

        <Button
          aria-label="Next month"
          variant="ghost"
          size="icon"
          className="rounded-sm rounded-r-none"
          render={
            switchingYears ? (
              <Link
                from={Route.fullPath}
                search={(prev) => ({ ...prev, ...toNextYear })}
              >
                <ChevronsRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                from={Route.fullPath}
                search={(prev) => ({ ...prev, ...toNext })}
              >
                <ChevronRightIcon className="h-4 w-4" />{" "}
              </Link>
            )
          }
        ></Button>

        <Button
          variant={"ghost"}
          onClick={() =>
            navigate({ search: (prev) => ({ ...prev, ...toToday }) })
          }
          className="border-border rounded-l-none border-l"
        >
          Today
        </Button>
      </div>
    </>
  );
};
