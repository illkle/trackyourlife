import { cn } from "@shad/utils";
import { Link } from "@tanstack/react-router";
import { format, subDays } from "date-fns";

import { PureDataRecord } from "@tyl/helpers/trackables";

import DayCellWrapper from "~/components/DayCell";
import { FavoriteButton } from "~/components/FavoriteButton";
import { useTrackableMeta } from "~/components/Providers/TrackableProvider";
import { TrackableNameText } from "~/components/TrackableName";

const MiniTrackable = ({
  className,
  data,
}: {
  className?: string;
  data: PureDataRecord[];
}) => {
  const { id } = useTrackableMeta();

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <Link
          to={`/app/trackables/${id}/`}
          className={cn(
            "mb-1 block w-full text-xl font-light text-neutral-950 dark:text-neutral-50",
          )}
        >
          <TrackableNameText />
        </Link>

        <FavoriteButton onlyIcon />
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
                  <span className="text-neutral-300 dark:text-neutral-800">
                    {format(day.date, "EEE")}
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-600">
                    {format(day.date, "d")}
                  </span>
                </div>
                <DayCellWrapper
                  value={day.value}
                  date={day.date}
                  labelType="none"
                  key={index}
                  className="h-16"
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
