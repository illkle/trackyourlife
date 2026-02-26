import { Pressable, View } from "react-native";
import { MoonIcon, SunIcon } from "lucide-react-native";

import type { IColorValue } from "@tyl/db/jsonValidators";
import { makeColorString, presetsArray } from "@tyl/helpers/colorTools";

import { cn } from "@/lib/utils";

export const ColorDisplay = ({ color, className }: { color: IColorValue; className?: string }) => {
  const currentLight = makeColorString(color.lightMode);
  const currentDark = makeColorString(color.darkMode);

  return (
    <View
      className={cn(
        "relative w-full overflow-hidden rounded-md border-2 border-muted bg-transparent",
        className,
      )}
    >
      <View
        className="absolute top-0 left-0 h-full w-full scale-200"
        style={{ backgroundColor: currentLight }}
      ></View>
      <View
        className="absolute top-0 left-1/2 h-full w-full"
        style={{
          backgroundColor: currentDark,
          transformOrigin: "left",
          transform: "rotate(35deg) scale(10)",
        }}
      ></View>

      <View className="absolute top-1/2 left-2 -translate-y-1/2">
        <SunIcon size={16} color="#000" />
      </View>
      <View className="absolute top-1/2 right-2 -translate-y-1/2">
        <MoonIcon size={16} color="#fff" />
      </View>
    </View>
  );
};

export const Presets = ({
  setColor,
  className,
}: {
  savedColor?: IColorValue;
  setColor: (v: IColorValue) => void;
  className?: string;
}) => {
  return (
    <View className={cn("flex-row flex-wrap gap-1", className)}>
      {presetsArray.map((col, index) => {
        return (
          <Pressable key={index} onPress={() => setColor(col)} className="w-[12%] min-w-9">
            <ColorDisplay color={col} className="h-7" />
          </Pressable>
        );
      })}
    </View>
  );
};
