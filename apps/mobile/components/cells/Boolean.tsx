import { Pressable } from "react-native";

export const CellBoolean = ({
  value,
  onChange,
  themeActiveLight,
  themeActiveDark,
  themeInactiveLight,
  themeInactiveDark,
  labelType = "auto",
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  themeActiveLight: string;
  themeActiveDark: string;
  themeInactiveLight: string;
  themeInactiveDark: string;
  labelType?: "auto" | "outside" | "none";
}) => {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      className="h-40 w-full rounded-xs border-2"
      style={{
        borderWidth: 2,
        borderColor: value ? themeInactiveLight : themeActiveLight,
        backgroundColor: value ? themeActiveLight : themeInactiveLight,
      }}
    ></Pressable>
  );
};
