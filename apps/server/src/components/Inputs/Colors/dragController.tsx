import type { CSSProperties, MutableRefObject } from "react";
import React, {
  createContext,
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "@shad/lib/utils";
import { TrashIcon } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useMediaQuery } from "usehooks-ts";

import { clamp } from "@tyl/helpers";
import { range } from "@tyl/helpers/animation";

import { useRefSize } from "~/utils/useRefSize";

const ControllerContext = createContext<{
  id: string;
  disableX: boolean;
  disableY: boolean;
  width: number;
  height: number;
  dataRef: MutableRefObject<{
    width: number;
    height: number;
    left: number;
    top: number;
  }>;
  forceRefresh: () => void;
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
} | null>(null);

const useControllerContextSafe = () => {
  const context = useContext(ControllerContext);
  if (!context) {
    throw new Error(
      "useControllerContext must be used within a ControllerRoot",
    );
  }
  return context;
};

type ControllerRootProps = React.ComponentPropsWithoutRef<"div"> & {
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
};

const getPanClass = (disableX: boolean, disableY: boolean) => {
  if (disableX && disableY) return "touch-none";
  if (disableX) return "touch-pan-x";
  if (disableY) return "touch-pan-y";
  return "touch-auto";
};

const getNearestSquarePoint = (
  x: number,
  y: number,
  left: number,
  top: number,
  right: number,
  bottom: number,
) => {
  return { x: clamp(x, left, right), y: clamp(y, top, bottom) };
};

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
  ...props
}: ControllerRootProps) => {
  const id = useId();

  const ref = useRef<HTMLDivElement>(null);
  const { width, height, dataRef, forceRefresh } = useRefSize(ref);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  /* These convert values to percentages for simple positioning */
  const valueToY = useCallback(
    (y: number) => {
      if (disableY) return 50;
      return range(yMin, yMax, 0, 100, y);
    },
    [yMin, yMax, disableY],
  );
  const valueToX = useCallback(
    (x: number) => {
      if (disableX) return 50;
      return range(xMin, xMax, 0, 100, x);
    },
    [xMin, xMax, disableX],
  );

  // These convert from coordinates in screen space to values
  const xToValue = useCallback(
    (x: number) => {
      if (disableX) return 50;
      return Math.round(
        range(
          dataRef.current.left,
          dataRef.current.width + dataRef.current.left,
          xMin,
          xMax,
          x,
        ),
      );
    },
    [xMin, xMax, dataRef, disableX],
  );
  const yToValue = useCallback(
    (y: number) => {
      if (disableY) return 50;
      return Math.round(
        range(
          dataRef.current.top,
          dataRef.current.height + dataRef.current.top,
          yMin,
          yMax,
          y,
        ),
      );
    },
    [yMin, yMax, dataRef, disableY],
  );

  // If onDragAway when a person drags away far enough it gets called, this calculates how far we are from that point
  const pointToDragAwayPercent = useCallback(
    ({ x, y }: { x: number; y: number }) => {
      if (typeof onDragAway !== "function") return 0;

      const { x: nX, y: nY } = getNearestSquarePoint(
        x,
        y,
        dataRef.current.left,
        dataRef.current.top,
        dataRef.current.left + width,
        dataRef.current.top + height,
      );

      const distance =
        Math.abs(nX - x) * (1 - Number(disableY)) +
        Math.abs(nY - y) * (1 - Number(disableX));

      return range(dragAwayDistance / 4, dragAwayDistance, 0, 100, distance);
    },
    [dataRef, width, height, dragAwayDistance, disableX, disableY, onDragAway],
  );

  const externallyControlled =
    typeof selectedPoint !== "undefined" &&
    typeof onSelectedPointChange === "function";
  const [selectedPointInternal, setSelectedPointInternal] = useState<
    string | null
  >(initialSelectedPointId ?? null);

  const clickHandler = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || draggingId) return;
    e.stopPropagation();

    onEmptySpaceClick?.({
      x: xToValue(e.clientX),
      y: yToValue(e.clientY),
    });
  };

  const getNearestPoint = (x: number, y: number) => {
    return getNearestSquarePoint(
      x,
      y,
      dataRef.current.left,
      dataRef.current.top,
      dataRef.current.left + width,
      dataRef.current.top + height,
    );
  };

  /*
  By default in boundary values(i.e 0,0) controller will be partially ouside Root container becuase it's center is value.
  It looks better to make it apper as if it's inside the root container
  To achieve this we add padding to ControllerRoot, and the actual mapped area will be smaller by that padding
  The only problem is that then onEmptySpaceClick wont work on padding. This solves it by setting it to boundary value when clicked.
  */
  const clickHandlerOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    const { x, y } = getNearestPoint(e.clientX, e.clientY);
    onEmptySpaceClick?.({
      x: xToValue(x),
      y: yToValue(y),
    });
  };

  const pointerDownHandler = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || draggingId) return;
    e.stopPropagation();
    forceRefresh();

    setDraggingId(initialSelectedPointId ?? null);
    document
      .getElementById(`${id}-${initialSelectedPointId}`)
      ?.setPointerCapture(e.pointerId);

    onEmptySpaceDrag?.({
      x: xToValue(e.clientX),
      y: yToValue(e.clientY),
    });
  };

  const ponterDownHandlerOutside = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    forceRefresh();

    setDraggingId(initialSelectedPointId ?? null);
    document
      .getElementById(`${id}-${initialSelectedPointId}`)
      ?.setPointerCapture(e.pointerId);

    const { x, y } = getNearestPoint(e.clientX, e.clientY);
    onEmptySpaceDrag?.({
      x: xToValue(x),
      y: yToValue(y),
    });
  };

  return (
    <div
      className={cn(
        /* Using outline instead of border, because "border" color token is semi transparent and Controller is used in color selection where style={background: gradient} is passed */
        "outline-border relative box-border rounded-md outline-2",
        disableX ? "" : "px-2 max-sm:px-3",
        disableY ? "" : "py-2 max-sm:py-3",
        getPanClass(disableX, disableY),
        className,
      )}
      onPointerDown={onEmptySpaceDrag ? ponterDownHandlerOutside : undefined}
      onClick={onEmptySpaceClick ? clickHandlerOutside : undefined}
      {...props}
    >
      <div
        ref={ref}
        className="relative h-full w-full"
        onPointerDown={onEmptySpaceDrag ? pointerDownHandler : undefined}
        onClick={onEmptySpaceClick ? clickHandler : undefined}
      >
        <ControllerContext.Provider
          value={{
            id,
            disableX,
            disableY,
            width,
            height,
            dataRef,
            forceRefresh,
            valueToX,
            xToValue,
            valueToY,
            yToValue,
            selectedPoint: externallyControlled
              ? selectedPoint
              : selectedPointInternal,
            setSelectedPoint: externallyControlled
              ? onSelectedPointChange
              : setSelectedPointInternal,
            onDragAway,
            pointToDragAwayPercent,
            draggingId,
            setDraggingId,
          }}
        >
          {children}
        </ControllerContext.Provider>
      </div>
    </div>
  );
};

type ControllerPointProps = React.ComponentPropsWithoutRef<"div"> & {
  x?: number;
  y?: number;
  id: string;
  onValueChange?: ({ x, y }: { x: number; y: number }) => void;
};

export const ControllerPoint = ({
  children,
  className,
  style,
  x,
  y,
  onValueChange,
  id,
  ...props
}: ControllerPointProps) => {
  const {
    id: rootId,
    width,
    height,
    valueToX,
    xToValue,
    valueToY,
    yToValue,
    selectedPoint,
    setSelectedPoint,
    onDragAway,
    pointToDragAwayPercent,
    disableX,
    disableY,
    forceRefresh,
    draggingId,
    setDraggingId,
  } = useControllerContextSafe();
  const isSelected = selectedPoint === id;

  const isActive = typeof onValueChange === "function";

  const isDraggingMe = draggingId === id;
  const xPercent = valueToX(x ?? 0);
  const yPercent = valueToY(y ?? 0);

  const pickupPosition = useRef({ x: 0, y: 0 });

  const [dragAwayPercent, setDragAwayPercent] = useState(0);

  const startDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if (e.ctrlKey) return;
    // It bugs when we are in modal than animates in or changes position
    forceRefresh();
    e.preventDefault();
    e.stopPropagation();
    setSelectedPoint(id);
    setDraggingId(id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const target = e.target as HTMLElement;
    const rect = target.getBoundingClientRect();

    pickupPosition.current = {
      x: e.clientX - (rect.left + rect.width / 2),
      y: e.clientY - (rect.top + rect.height / 2),
    };
  };
  const moveDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingMe) return;

    e.preventDefault();
    e.stopPropagation();

    setDragAwayPercent(
      pointToDragAwayPercent({
        x: e.clientX - pickupPosition.current.x,
        y: e.clientY - pickupPosition.current.y,
      }),
    );

    onValueChange?.({
      x: xToValue(e.clientX - pickupPosition.current.x),
      y: yToValue(e.clientY - pickupPosition.current.y),
    });
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    setDraggingId(null);
    e.stopPropagation();
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    if (dragAwayPercent >= 100) {
      onDragAway?.(id);
    }
    pickupPosition.current = { x: 0, y: 0 };
    setDragAwayPercent(0);
  };

  const handlers = isActive
    ? {
        onPointerDown: startDrag,
        onPointerUp: endDrag,
        onPointerMove: moveDrag,
        onPointerCancel: endDrag,
        onLostPointerCapture: endDrag,
      }
    : {};

  const isTouch = useMediaQuery("(pointer:coarse)");

  return (
    <div
      data-selected={isSelected}
      data-active={isActive}
      data-fading={dragAwayPercent > 0}
      data-disabled-x={disableX}
      data-disabled-y={disableY}
      className={cn(
        "absolute box-border",
        "w-4 data-[disabled-x=true]:w-[110%] max-sm:w-6",
        "h-4 data-[disabled-y=true]:h-[110%] max-sm:h-6",
        "border-foreground ring-ring border-2 ring-2",
        "data-[active=false]:border data-[active=false]:ring-1",
        "opacity-50 data-[selected=true]:opacity-100",
        "rounded-md",
        "transition-opacity",
        isActive
          ? dragAwayPercent >= 100
            ? "cursor-default"
            : "cursor-grab"
          : "",
        isSelected ? "z-20" : "z-10",
        className,
      )}
      style={
        {
          left: width ? 0 : xPercent + "%",
          top: height ? 0 : yPercent + "%",
          transform: `translateX(calc(-50% + ${
            width ? (width * xPercent) / 100 : 0
          }px)) translateY(calc(-50% + ${
            height ? (height * yPercent) / 100 : 0
          }px))  scale(${range(0, 100, 1, 0.9, dragAwayPercent)})`,

          "--drag-away-fade": dragAwayPercent + "%",
          "--drag-away-fade-size": range(0, 15, 0, 13, dragAwayPercent) + "px",

          ...style,
        } as CSSProperties
      }
      {...props}
    >
      <AnimatePresence>
        {isTouch && isDraggingMe && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute -top-2 left-1/2 h-5 w-5 -translate-x-1/2 -translate-y-[100%] rounded-md",
              "border-foreground ring-ring border ring-1",
              className,
            )}
            style={{ ...style }}
          />
        )}
      </AnimatePresence>

      <m.div
        animate={{
          opacity: dragAwayPercent / 100,
        }}
        transition={{ duration: 0 }}
        className="bg-muted absolute bottom-0 left-0 h-full w-full rounded-sm"
      >
        <TrashIcon
          className="text-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          size={11}
          style={{
            opacity: range(50, 100, 0, 1, dragAwayPercent),
          }}
        />
      </m.div>

      {children}
      <div
        id={`${rootId}-${id}`}
        className={cn(
          "absolute top-0 left-0 h-[calc(100%+2px)] w-[calc(100%+2px)]",
          isTouch && "h-[calc(100%+10px)] w-[calc(100%+10px)]",
        )}
        {...handlers}
        onTouchStart={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
      ></div>
    </div>
  );
};
