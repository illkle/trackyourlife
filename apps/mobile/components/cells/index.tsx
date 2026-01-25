import { useMemo } from "react";
import { format, isAfter, isBefore, isSameDay } from "date-fns";

import { DayCellTextPopup } from "./Text";
import { useTrackableFlag } from "@tyl/helpers/data/TrackableFlagsProvider";
import { useTrackableMeta } from "@tyl/helpers/data/TrackableMetaProvider";
import { useRecordDeleteHandler, useRecordUpdateHandler } from "@tyl/helpers/data/dbHooks";
import { DayCellBoolean } from "./Boolean";
import { DayCellNumber } from "./Number";
import { useTrackableDataFromContext } from "@tyl/helpers/data/TrackableDataProvider";
import { DbTrackableRecordSelect } from "@tyl/db/client/schema-powersync";
import { cn } from "@/lib/utils";
import { View } from "react-native";

export const DayCellBaseClasses =
  "w-full h-full relative overflow-hidden border-transparent border-2 rounded-xs";

interface DayCellRouterProps {
  className?: string;
  labelType: IDayCellLabelType;
  disabled?: boolean;
  timestamp: Date;
}

export type IDayCellLabelType = "auto" | "outside" | "none";

export interface IDayCellData {
  type: string;
  timestamp: Date;
  isToday: boolean;
  isOutOfRange: boolean;
  onChange: ReturnType<typeof useRecordUpdateHandler>;
  onDelete: ReturnType<typeof useRecordDeleteHandler>;
  labelType?: IDayCellLabelType;
  values: DbTrackableRecordSelect[];
}

export type IDayCellProps = { cellData: IDayCellData };

export const DayCellRouter = ({ timestamp, labelType = "auto", className }: DayCellRouterProps) => {
  const { id, type } = useTrackableMeta();
  const trackingStart = useTrackableFlag(id, "AnyTrackingStart");

  const now = useMemo(() => new Date(), []);
  const isToday = useMemo(() => isSameDay(timestamp, now), [timestamp, now]);
  const isOutOfRange = useMemo(
    () => isAfter(timestamp, now) || Boolean(trackingStart && isBefore(timestamp, trackingStart)),
    [timestamp, now, trackingStart],
  );

  const onChange = useRecordUpdateHandler({
    date: timestamp,
    trackableId: id,
    type,
  });
  const onDelete = useRecordDeleteHandler();

  const values = useTrackableDataFromContext(id, timestamp);

  const cellData = {
    type,
    isOutOfRange,
    values,
    onChange,
    onDelete,
    labelType,
    timestamp,
    isToday,
  };

  return (
    <div className={cn("relative flex flex-1 flex-col", className)}>
      {labelType === "outside" && <LabelOutside cellData={cellData} />}
      <DayCellTypeRouter cellData={cellData}></DayCellTypeRouter>
    </div>
  );
};

export const DayCellTypeRouter = (props: IDayCellProps) => {
  if (props.cellData.isOutOfRange) {
    return <OutOfRangeSimple {...props} />;
  }

  if (props.cellData.type === "boolean") {
    return <DayCellBoolean cellData={props.cellData} />;
  }

  if (props.cellData.type === "number") {
    return <DayCellNumber cellData={props.cellData} />;
  }

  if (props.cellData.type === "text") {
    return <DayCellTextPopup cellData={props.cellData} />;
  }

  throw new Error("Unsupported trackable type");
};

export const OutOfRangeSimple = (props: IDayCellProps) => {
  return (
    <View className={cn(DayCellBaseClasses, "bg-muted opacity-30")}>
      {props.cellData.labelType === "auto" && <LabelInside {...props} />}
    </View>
  );
};

const LabelOutside = (props: IDayCellProps) => {
  return (
    <View
      className={cn(
        "mr-1 text-right text-xs text-muted-foreground",
        props.cellData.isToday ? "font-normal underline" : "font-light",
      )}
    >
      {format(props.cellData.timestamp, "d")}
    </View>
  );
};

export const LabelInside = (props: IDayCellProps) => {
  return (
    <View
      className={cn(
        "absolute top-0 left-1 z-10 text-base text-muted-foreground select-none",
        props.cellData.isToday ? "font-normal underline" : "font-light",
        "text-xs sm:text-base",
      )}
    >
      {format(props.cellData.timestamp, "d")}
    </View>
  );
};

export default DayCellRouter;
