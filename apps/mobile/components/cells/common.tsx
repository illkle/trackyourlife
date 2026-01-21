/*
export const OutOfRangeSimple = () => {
  const { labelType } = useDayCellContext();

  return (
    <div className={cn(DayCellBaseClasses, "cursor-default bg-muted opacity-30")}>
      {labelType === "auto" && <LabelInside />}
    </div>
  );
};

const LabelOutside = () => {
  const { timestamp, isToday } = useDayCellContext();

  return (
    <div
      className={cn(
        "mr-1 text-right text-xs text-muted-foreground",
        isToday ? "font-normal underline" : "font-light",
      )}
    >
      {format(timestamp, "d")}
    </div>
  );
};

export const LabelInside = () => {
  const { timestamp, isToday } = useDayCellContext();
  return (
    <div
      className={cn(
        "absolute top-0 left-1 z-10 text-base text-muted-foreground select-none",
        isToday ? "font-normal underline" : "font-light",
        "text-xs sm:text-base",
      )}
    >
      {format(timestamp, "d")}
    </div>
  );
};
*/
