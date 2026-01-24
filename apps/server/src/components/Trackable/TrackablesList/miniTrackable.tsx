import { cn } from "@shad/lib/utils";
import { Link } from "@tanstack/react-router";
import { eachDayOfInterval, format } from "date-fns";

import DayCellRouter from "~/components/DayCell";
import { FavoriteButton } from "~/components/Trackable/FavoriteButton";
import { TrackableNameText } from "~/components/Trackable/TrackableName";
import { useMemo } from "react";
import { useTrackableMeta } from "~/components/Trackable/TrackableProviders/TrackableProvider";

const MiniTrackable = ({
  className,
  firstDay,
  lastDay,
}: {
  className?: string;
  firstDay: Date;
  lastDay: Date;
}) => {
  const days = useMemo(
    () => eachDayOfInterval({ start: firstDay, end: lastDay }),
    [firstDay, lastDay],
  );

  const { id } = useTrackableMeta();

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <Link
          to={"/app/trackables/$id/view"}
          params={{ id }}
          className={cn("mb-1 block w-full text-xl font-light text-foreground")}
        >
          <TrackableNameText />
        </Link>

        <FavoriteButton onlyIcon />
      </div>

      <div className={"sm grid grid-cols-3 gap-x-1 gap-y-1 md:grid-cols-6"}>
        <>
          {days.map((day, index) => {
            return (
              <div
                key={index}
                className={cn(
                  "gap-1",
                  index === 0 ? "hidden md:flex" : "flex",
                  index > 3 ? "flex-col-reverse md:flex-col" : "flex-col",
                )}
              >
                <div className="flex justify-end gap-1 text-xs">
                  <span className="text-muted-foreground opacity-50">{format(day, "EEE")}</span>
                  <span className="text-muted-foreground">{format(day, "d")}</span>
                </div>
                <DayCellRouter
                  key={index}
                  timestamp={day}
                  labelType="none"
                  className="max-h-16 min-h-16"
                />
              </div>
            );
          })}
        </>
      </div>
    </div>
  );
};

export default MiniTrackable;
