import type { LayoutChangeEvent, StyleProp, ViewProps, ViewStyle } from "react-native";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { TrashIcon } from "lucide-react-native";

import { clamp, range } from "@tyl/helpers/animation";

import { cn } from "@/lib/utils";

type LayoutData = {
  width: number;
  height: number;
  left: number;
  top: number;
};

type ControllerContextValue = {
  id: string;
  disableX: boolean;
  disableY: boolean;
  layoutRef: React.MutableRefObject<LayoutData>;
  valueToX: (x: number) => number;
  xToValue: (x: number) => number;
  valueToY: (y: number) => number;
  yToValue: (y: number) => number;
  pointToDragAwayPercent: ({ x, y }: { x: number; y: number }) => number;
  selectedPoint: string | null;
  setSelectedPoint: (id: string | null) => void;
  onDragAway?: (id: string) => void;
  draggingId: string | null;
  setDraggingId: (id: string | null) => void;
  refreshLayout: () => void;
};

const ControllerContext = createContext<ControllerContextValue | null>(null);

const useControllerContextSafe = () => {
  const context = useContext(ControllerContext);

  if (!context) {
    throw new Error("useControllerContextSafe must be used inside ControllerRoot");
  }

  return context;
};

type ControllerRootProps = ViewProps & {
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  initialSelectedPointId?: string;
  disableY?: boolean;
  disableX?: boolean;
  onEmptySpaceClick?: ({ x, y }: { x: number; y: number }) => void;
  onEmptySpaceDrag?: ({ x, y }: { x: number; y: number }) => void;
  onDragAway?: (id: string) => void;
  dragAwayDistance?: number;
  selectedPoint?: string | null;
  onSelectedPointChange?: (id: string | null) => void;
  style?: StyleProp<ViewStyle>;
};

const getNearestSquarePoint = (
  x: number,
  y: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
) => ({
  x: clamp(x, left, right),
  y: clamp(y, top, bottom),
});

export const ControllerRoot = ({
  className,
  children,
  xMin = 0,
  xMax = 100,
  yMin = 0,
  yMax = 100,
  initialSelectedPointId,
  disableY = false,
  disableX = false,
  onEmptySpaceClick,
  onEmptySpaceDrag,
  onDragAway,
  dragAwayDistance = 150,
  selectedPoint,
  onSelectedPointChange,
  style,
  ...props
}: ControllerRootProps) => {
  const id = useMemo(() => `controller-${Math.random().toString(36).slice(2)}`, []);
  const ref = useRef<View>(null);
  const layoutRef = useRef<LayoutData>({ width: 0, height: 0, left: 0, top: 0 });
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const externallyControlled =
    typeof selectedPoint !== "undefined" && typeof onSelectedPointChange === "function";
  const [selectedPointInternal, setSelectedPointInternal] = useState<string | null>(
    initialSelectedPointId ?? null,
  );

  const refreshLayout = useCallback(() => {
    ref.current?.measureInWindow((x, y, width, height) => {
      layoutRef.current = { left: x, top: y, width, height };
    });
  }, []);

  const onLayout = useCallback(
    (_event: LayoutChangeEvent) => {
      refreshLayout();
    },
    [refreshLayout],
  );

  const valueToX = useCallback(
    (x: number) => {
      if (disableX) return 50;
      return range(xMin, xMax, 0, 100, x);
    },
    [disableX, xMax, xMin],
  );

  const valueToY = useCallback(
    (y: number) => {
      if (disableY) return 50;
      return range(yMin, yMax, 0, 100, y);
    },
    [disableY, yMax, yMin],
  );

  const xToValue = useCallback(
    (x: number) => {
      if (disableX) return 50;
      const l = layoutRef.current;
      return Math.round(range(l.left, l.left + l.width, xMin, xMax, x));
    },
    [disableX, xMax, xMin],
  );

  const yToValue = useCallback(
    (y: number) => {
      if (disableY) return 50;
      const l = layoutRef.current;
      return Math.round(range(l.top, l.top + l.height, yMin, yMax, y));
    },
    [disableY, yMax, yMin],
  );

  const pointToDragAwayPercent = useCallback(
    ({ x, y }: { x: number; y: number }) => {
      if (typeof onDragAway !== "function") return 0;

      const l = layoutRef.current;
      const nearest = getNearestSquarePoint(x, y, l.left, l.top, l.left + l.width, l.top + l.height);

      const distance =
        Math.abs(nearest.x - x) * (1 - Number(disableY)) +
        Math.abs(nearest.y - y) * (1 - Number(disableX));

      return range(dragAwayDistance / 4, dragAwayDistance, 0, 100, distance);
    },
    [disableX, disableY, dragAwayDistance, onDragAway],
  );

  const toValuePair = useCallback(
    (absoluteX: number, absoluteY: number, clampToBounds: boolean) => {
      if (!clampToBounds) {
        return { x: xToValue(absoluteX), y: yToValue(absoluteY) };
      }

      const l = layoutRef.current;
      const nearest = getNearestSquarePoint(
        absoluteX,
        absoluteY,
        l.left,
        l.top,
        l.left + l.width,
        l.top + l.height,
      );

      return { x: xToValue(nearest.x), y: yToValue(nearest.y) };
    },
    [xToValue, yToValue],
  );

  const handleEmptyDragStart = useCallback(() => {
    refreshLayout();
    setDraggingId(initialSelectedPointId ?? null);
  }, [initialSelectedPointId, refreshLayout]);

  const handleEmptyDragMove = useCallback(
    (absoluteX: number, absoluteY: number) => {
      onEmptySpaceDrag?.(toValuePair(absoluteX, absoluteY, true));
    },
    [onEmptySpaceDrag, toValuePair],
  );

  const handleEmptyDragEnd = useCallback(() => {
    setDraggingId(null);
  }, []);

  const handleEmptyTap = useCallback(
    (absoluteX: number, absoluteY: number) => {
      onEmptySpaceClick?.(toValuePair(absoluteX, absoluteY, true));
    },
    [onEmptySpaceClick, toValuePair],
  );

  const emptyPan = Gesture.Pan()
    .enabled(Boolean(onEmptySpaceDrag))
    .onBegin(() => {
      runOnJS(handleEmptyDragStart)();
    })
    .onUpdate((e) => {
      runOnJS(handleEmptyDragMove)(e.absoluteX, e.absoluteY);
    })
    .onFinalize(() => {
      runOnJS(handleEmptyDragEnd)();
    });

  const emptyTap = Gesture.Tap()
    .enabled(Boolean(onEmptySpaceClick))
    .onEnd((e, success) => {
      if (!success) return;
      runOnJS(handleEmptyTap)(e.absoluteX, e.absoluteY);
    });

  const gesture = Gesture.Simultaneous(emptyTap, emptyPan);

  return (
    <GestureDetector gesture={gesture}>
      <View
        className={cn(
          "relative overflow-hidden rounded-md border border-border",
          disableX ? "" : "px-2",
          disableY ? "" : "py-2",
          className,
        )}
        style={style}
        {...props}
      >
        <View ref={ref} className="relative h-full w-full" onLayout={onLayout}>
          <ControllerContext.Provider
            value={{
              id,
              disableX,
              disableY,
              layoutRef,
              valueToX,
              xToValue,
              valueToY,
              yToValue,
              selectedPoint: externallyControlled ? selectedPoint ?? null : selectedPointInternal,
              setSelectedPoint: externallyControlled ? onSelectedPointChange : setSelectedPointInternal,
              onDragAway,
              pointToDragAwayPercent,
              draggingId,
              setDraggingId,
              refreshLayout,
            }}
          >
            {children}
          </ControllerContext.Provider>
        </View>
      </View>
    </GestureDetector>
  );
};

type ControllerPointProps = ViewProps & {
  x?: number;
  y?: number;
  id: string;
  onValueChange?: ({ x, y }: { x: number; y: number }) => void;
};

export const ControllerPoint = ({
  className,
  style,
  x,
  y,
  onValueChange,
  id,
  children,
  ...props
}: ControllerPointProps) => {
  const {
    disableX,
    disableY,
    valueToX,
    xToValue,
    valueToY,
    yToValue,
    selectedPoint,
    setSelectedPoint,
    onDragAway,
    pointToDragAwayPercent,
    draggingId,
    setDraggingId,
    refreshLayout,
  } = useControllerContextSafe();

  const isSelected = selectedPoint === id;
  const isActive = typeof onValueChange === "function";
  const isDraggingMe = draggingId === id;
  const [dragAwayPercent, setDragAwayPercent] = useState(0);

  const xPercent = valueToX(x ?? 0);
  const yPercent = valueToY(y ?? 0);

  const startDrag = useCallback(() => {
    refreshLayout();
    setSelectedPoint(id);
    setDraggingId(id);
  }, [id, refreshLayout, setDraggingId, setSelectedPoint]);

  const moveDrag = useCallback(
    (absoluteX: number, absoluteY: number) => {
      if (!isActive) return;

      const away = pointToDragAwayPercent({ x: absoluteX, y: absoluteY });
      setDragAwayPercent(away);

      onValueChange?.({
        x: xToValue(absoluteX),
        y: yToValue(absoluteY),
      });
    },
    [isActive, onValueChange, pointToDragAwayPercent, xToValue, yToValue],
  );

  const endDrag = useCallback(() => {
    setDraggingId(null);
    if (dragAwayPercent >= 100) {
      onDragAway?.(id);
    }
    setDragAwayPercent(0);
  }, [dragAwayPercent, id, onDragAway, setDraggingId]);

  const dragGesture = Gesture.Pan()
    .enabled(isActive)
    .onBegin(() => {
      runOnJS(startDrag)();
    })
    .onUpdate((e) => {
      runOnJS(moveDrag)(e.absoluteX, e.absoluteY);
    })
    .onFinalize(() => {
      runOnJS(endDrag)();
    });

  return (
    <View
      className={cn("absolute left-0 top-0")}
      style={{
        left: disableX ? 0 : `${xPercent}%`,
        top: disableY ? 0 : `${yPercent}%`,
        width: disableX ? "100%" : undefined,
        height: disableY ? "100%" : undefined,
      }}
      pointerEvents="box-none"
    >
      <GestureDetector gesture={dragGesture}>
        <Pressable
          className={cn(
            "relative rounded-md border-2 border-foreground",
            isSelected ? "z-20 opacity-100" : "z-10 opacity-60",
            !isActive && "border border-foreground/50",
            className,
          )}
          style={[
            disableY
              ? {
                  width: 14,
                  height: "100%",
                  marginLeft: -7,
                  marginTop: 0,
                  borderRadius: 8,
                }
              : disableX
                ? {
                    width: "100%",
                    height: 14,
                    marginLeft: 0,
                    marginTop: -7,
                    borderRadius: 8,
                  }
                : {
                    width: 20,
                    height: 20,
                    marginLeft: -10,
                    marginTop: -10,
                    borderRadius: 999,
                  },
            style,
          ]}
          {...props}
        >
          <View
            pointerEvents="none"
            className="absolute inset-0 items-center justify-center rounded-md bg-muted"
            style={{ opacity: dragAwayPercent / 100 }}
          >
            <TrashIcon size={11} color="#6b7280" />
          </View>
          {children}
          {isDraggingMe && (
            <View
              pointerEvents="none"
              className={cn(
                "absolute -top-2 left-1/2 h-5 w-5 -translate-x-1/2 -translate-y-full rounded-full border border-foreground",
                className,
              )}
              style={style}
            />
          )}
        </Pressable>
      </GestureDetector>
    </View>
  );
};
