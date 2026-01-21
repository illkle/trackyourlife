import { Pressable, Text } from "react-native";
import { useCallback, useRef } from "react";
import { useResolveClassNames } from "uniwind";
import { BottomSheetModal, BottomSheetTextInput, BottomSheetView } from "@gorhom/bottom-sheet";

export const CellNumber = ({
  value,
  onChange,
  labelType = "auto",
}: {
  value: number;
  onChange: (value: number) => void;

  labelType?: "auto" | "outside" | "none";
}) => {
  const styles = useResolveClassNames("bg-background");

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  return (
    <>
      <Pressable onPress={handlePresentModalPress} className="rounded-md border-2 border-white p-4">
        <Text className="text-center text-3xl text-white">{value}</Text>
      </Pressable>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        onChange={handleSheetChanges}
        backgroundStyle={styles}
      >
        <BottomSheetView className="h-30">
          <BottomSheetTextInput
            autoFocus
            className="text-white"
            value={value.toString()}
            onChangeText={(v) => onChange(Number(v))}
            onBlur={() => bottomSheetModalRef.current?.close()}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
};
