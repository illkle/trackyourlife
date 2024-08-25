import {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import {
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import { makeColorString } from "@tyl/helpers/colorTools";

import { useDayCellContextNumber } from "~/app/_components/DayCellProvider";
import { Input, InputStyle } from "~/app/_ui/input";
import { twColors } from "~/utils/tailwindColors";
import { tw, tws } from "~/utils/tw";

const getNumberSafe = (v: string | undefined) => {
  if (!v) return 0;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
};

export const NumberFormatter = new Intl.NumberFormat("en-US", {
  compactDisplay: "short",
  notation: "compact",
});

export const DayCellNumber = ({
  value,
  onChange,
  children,
  dateDay,
  style,
}: {
  value?: string;
  onChange?: (v: string) => Promise<void> | void;
  children?: ReactNode;
  dateDay: Date;
  style?: ViewStyle;
}) => {
  const colorScheme = useColorScheme();

  const { valueToColor, valueToProgressPercentage } = useDayCellContextNumber();

  const [internalNumber, setInternalNumber] = useState(getNumberSafe(value));
  const [rawInput, setRawInput] = useState<string>(String(internalNumber));

  const [isEditing, setIsEditing] = useState(false);

  useLayoutEffect(() => {
    if (internalNumber !== getNumberSafe(value)) {
      setInternalNumber(getNumberSafe(value));

      if (!isEditing) {
        setRawInput(String(internalNumber));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => [130], []);

  const isBigNumber = internalNumber >= 10000;

  const displayedValue = isBigNumber
    ? NumberFormatter.format(internalNumber)
    : internalNumber;

  const internalUpdate = async (val: number) => {
    setInternalNumber(val);
    if (onChange) {
      onChange(String(val));
    }
  };

  const handleInput = (value: string) => {
    const replaced = value.replace(",", ".");
    setRawInput(replaced);
    const numeric = Number(replaced);

    if (!Number.isNaN(numeric)) {
      internalUpdate(numeric);
    }
  };

  const progress = valueToProgressPercentage(internalNumber);

  const color = useMemo(() => {
    const c = valueToColor(internalNumber);

    return makeColorString(colorScheme === "dark" ? c.darkMode : c.lightMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalNumber, colorScheme]);

  const animatedStylesContainer = useAnimatedStyle(() => {
    return {
      borderColor: withTiming(color, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      }),
    };
  });

  const animatedStylesFill = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(color),
      height: withTiming(
        typeof progress === "number" ? 80 * (progress / 100) : 80,
        {
          easing: Easing.out(Easing.cubic),
          duration: 300,
        },
      ),
    };
  });

  return (
    <View>
      <Pressable
        style={[tws("h-[80px] w-full flex"), style]}
        onPress={() => {
          setIsEditing(true);
          bottomSheetModalRef.current?.present();
        }}
      >
        <Animated.View
          style={[
            tws(
              "border-2 w-full h-full flex items-center justify-center rounded-sm ",
            ),
            animatedStylesContainer,
          ]}
        >
          <Text
            style={tws(
              "z-2 text-xl font-bold text-center",
              internalNumber === 0
                ? "text-neutral-50 dark:text-neutral-900"
                : "text-neutral-800 dark:text-neutral-300",
            )}
          >
            {internalNumber}
          </Text>

          {typeof progress === "number" && (
            <Animated.View
              style={[
                tws("w-full h-full absolute bottom-0 rounded-[1px]"),
                animatedStylesFill,
              ]}
            ></Animated.View>
          )}
        </Animated.View>
        {children}
      </Pressable>

      <BottomSheetModal
        backgroundStyle={tws("bg-red-500 dark:bg-neutral-900")}
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        style={tws("flex px-4")}
      >
        <BottomSheetView style={tws("flex items-center ")}>
          <BottomSheetTextInput
            value={rawInput}
            autoFocus
            selectionColor={
              colorScheme === "dark"
                ? twColors.neutral[600]
                : twColors.neutral[400]
            }
            style={[
              InputStyle(),
              tws("w-full h-14 text-center font-bold text-2xl"),
            ]}
            onBlur={() => {
              bottomSheetModalRef.current?.close();
              setIsEditing(false);
            }}
            onFocus={(e) => {
              if (!rawInput || rawInput === "0") {
                // @ts-expect-error wrong typing
                e.target.setSelection(0, String(rawInput).length);
              }
            }}
            onChangeText={handleInput}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "grey",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
});
