import { router } from "expo-router";
import { Pressable, View } from "react-native";

import type { IColorValue } from "@tyl/db/jsonValidators";
import { presetsMap } from "@tyl/helpers/colorTools";

import { ColorDisplay } from "@/components/inputs/colors/colorDisplay";
import { openInputEditorModalDraft } from "@/lib/inputEditorModalStore";

export const ColorInput = ({
  value = presetsMap.neutral,
  onChange,
}: {
  value?: IColorValue;
  onChange: (v: IColorValue, timestamp?: number) => void;
}) => {
  return (
    <View className="gap-3">
      <Pressable
        className="h-9 w-36 flex-row items-center gap-2"
        onPress={() => {
          const draftId = openInputEditorModalDraft({
            kind: "color",
            value,
            onChange,
          });

          router.push({
            pathname: "/inputEditorModal",
            params: {
              draftId,
              kind: "color",
            },
          });
        }}
      >
        <ColorDisplay color={value} className="h-9 flex-1" />
      </Pressable>
    </View>
  );
};
