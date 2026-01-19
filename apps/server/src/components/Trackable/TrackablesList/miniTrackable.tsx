import { cn } from "@shad/lib/utils";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";

import type { PureDataRecord } from "@tyl/helpers/data/trackables";
import { DbTrackableGroupSelect, DbTrackableSelect } from "@tyl/db/client/schema-powersync";

import DayCellRouter from "~/components/DayCell";
import { FavoriteButton } from "~/components/Trackable/FavoriteButton";
import { TrackableNameText } from "~/components/Trackable/TrackableName";

const MiniTrackable = ({
  className,
  data,
  trackable,
}: {
  className?: string;
  data: PureDataRecord[];
  trackable: DbTrackableSelect & { groups: DbTrackableGroupSelect[] };
}) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <Link
          to={"/app/trackables/$id/view"}
          params={{ id: trackable.id }}
          className={cn("mb-1 block w-full text-xl font-light text-foreground")}
        >
          <TrackableNameText trackable={trackable} />
        </Link>

        <FavoriteButton onlyIcon trackable={trackable} />
      </div>

      <div className={"sm grid grid-cols-3 gap-x-1 gap-y-1 md:grid-cols-6"}>
        <>
          {data.map((day, index) => {
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
                  <span className="text-muted-foreground opacity-50">
                    {format(day.timestamp, "EEE")}
                  </span>
                  <span className="text-muted-foreground">{format(day.timestamp, "d")}</span>
                </div>
                <DayCellRouter
                  key={index}
                  {...day}
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
