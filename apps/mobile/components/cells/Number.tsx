import { Pressable, Text } from "react-native";
import { useCallback, useRef } from "react";
import { useResolveClassNames } from "uniwind";
import { BottomSheetModal, BottomSheetTextInput, BottomSheetView } from "@gorhom/bottom-sheet";
import { useTrackableMeta } from "@tyl/helpers/data/TrackableMetaProvider";
import { IDayCellProps, LabelInside } from "@/components/cells";
import { useLinkedValue } from "@tyl/helpers/useDbLinkedValue";
import { getNumberSafe } from "@tyl/helpers/numberTools";

export const NumberUI = ({
  value,
  onChange,
  timestamp,
  children,
}: {
  value?: string;
  onChange: (value: string) => void;
  timestamp: number;
  children: React.ReactNode;
}) => {
  const styles = useResolveClassNames("bg-background");

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const { internalValue, internalValueValidated, updateHandler, reset } = useLinkedValue({
    value: String(getNumberSafe(value)),
    onChange,
    timestamp: timestamp,
    validate: (v) => {
      return !Number.isNaN(Number(v));
    },
  });

  const internalNumber = getNumberSafe(internalValueValidated);

  const handleInputBlur = () => {
    if (internalValue !== internalValueValidated) {
      reset();
    }
    bottomSheetModalRef.current?.close();
  };

  return (
    <>
      <Pressable onPress={handlePresentModalPress} className="rounded-md border-2 border-white p-4">
        <Text className="text-center text-3xl text-white">{value}</Text>
        {children}
      </Pressable>
      <BottomSheetModal ref={bottomSheetModalRef} backgroundStyle={styles}>
        <BottomSheetView className="h-30">
          <BottomSheetTextInput
            autoFocus
            className="text-white"
            value={String(internalNumber)}
            onChangeText={(v) => updateHandler(v)}
            onBlur={handleInputBlur}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
};

export const DayCellNumber = (props: IDayCellProps) => {
  const { id } = useTrackableMeta();

  const { onChange, labelType, values, timestamp } = props.cellData;
  const { value, id: recordId, updated_at: updatedAt } = values[0] ?? {};

  return (
    <NumberUI
      value={value}
      onChange={(v) => void onChange({ value: v, recordId, updatedAt: new Date().getTime() })}
      timestamp={updatedAt ?? 0}
    >
      {labelType === "auto" && <LabelInside cellData={props.cellData} />}
    </NumberUI>
  );
};
