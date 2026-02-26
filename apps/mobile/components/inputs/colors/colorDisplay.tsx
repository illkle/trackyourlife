import { Pressable, View } from "react-native";
import { MoonIcon, SunIcon } from "lucide-react-native";
import Svg, { Polygon, Rect } from "react-native-svg";

import type { IColorValue } from "@tyl/db/jsonValidators";
import { makeColorString, presetsArray } from "@tyl/helpers/colorTools";

import { cn } from "@/lib/utils";

export const ColorDisplay = ({
  color,
  className,
}: {
  color: IColorValue;
  className?: string;
}) => {
  const currentLight = makeColorString(color.lightMode);
  const currentDark = makeColorString(color.darkMode);

  return (
    <View
      className={cn(
        "relative w-full overflow-hidden rounded-md border-2 border-border bg-transparent",
        className,
      )}
    >
      <View className="absolute inset-0">
        <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <Rect x={0} y={0} width={100} height={100} fill={currentLight} />
          <Polygon points="52,0 100,0 100,100 36,100" fill={currentDark} />
        </Svg>
      </View>

      <SunIcon
        size={14}
        color="#000"
        style={{ position: "absolute", left: 6, top: "50%", marginTop: -7, zIndex: 20 }}
      />
      <MoonIcon
        size={14}
        color="#fff"
        style={{ position: "absolute", right: 6, top: "50%", marginTop: -7, zIndex: 20 }}
      />
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
