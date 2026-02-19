import { cn } from "@/lib/utils";
import { Text, View } from "react-native";
import { format } from "date-fns";
import { DbTrackableRecordSelect } from "@tyl/db/client/schema-powersync";
import { useRecordDeleteHandler, useRecordUpdateHandler } from "@tyl/helpers/data/dbHooks";

export const DayCellBaseClasses = "w-full h-20 relative overflow-hidden border-2 rounded-xs";

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

export const OutOfRangeSimple = (props: IDayCellProps) => {
  return (
    <View className={cn(DayCellBaseClasses, "border-muted bg-muted opacity-30")}>
      {props.cellData.labelType === "auto" && <LabelInside {...props} />}
    </View>
  );
};

export const LabelOutside = (props: IDayCellProps) => {
  return (
    <Text
      className={cn(
        "mr-1 text-right text-xs text-muted-foreground",
        props.cellData.isToday ? "font-normal underline" : "font-light",
      )}
    >
      {format(props.cellData.timestamp, "d")}
    </Text>
  );
};

export const LabelInside = (props: IDayCellProps) => {
  return (
    <Text
      className={cn(
        "absolute top-0 left-1 z-10 text-base text-muted-foreground select-none",
        props.cellData.isToday ? "font-bold underline" : "",
        "text-sm sm:text-base",
      )}
    >
      {format(props.cellData.timestamp, "d")}
    </Text>
  );
};
