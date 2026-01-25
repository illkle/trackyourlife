import { IDayCellProps } from "@/components/cells";
import { Text } from "react-native";

export const DayCellTextPopup = (props: IDayCellProps) => {
  const { labelType, values } = props.cellData;
  const { value } = values[0] ?? {};

  return <Text>{value}</Text>;
};
