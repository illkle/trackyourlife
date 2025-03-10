import type { CSSProperties, MouseEvent } from "react";
import { useRef, useState } from "react";
import { cn } from "@shad/utils";

import { clamp } from "@tyl/helpers";

import {
  DayCellBaseClasses,
  DayCellBaseClassesFocus,
  LabelInside,
  useDayCellContext,
} from "~/components/DayCell";
import { useTrackableFlag } from "~/components/Trackable/TrackableProviders/TrackableFlagsProvider";
import { useTrackableMeta } from "~/components/Trackable/TrackableProviders/TrackableProvider";
import { useAllowAnimation } from "~/utils/useAllowAnimation";

const ANIMATION_TIME = 0.3;

export const DayCellBoolean = () => {
  const { id } = useTrackableMeta();

  const { labelType, onChange, values } = useDayCellContext();
  const { value, recordId } = values[0] ?? {};

  const { lightMode: themeActiveLight, darkMode: themeActiveDark } =
    useTrackableFlag(id, "BooleanCheckedColor");
  const { lightMode: themeInactiveLight, darkMode: themeInactiveDark } =
    useTrackableFlag(id, "BooleanUncheckedColor");

  // Even though we're not using any values from context it's useful to check whether it's provided

  const { animationMultiplier, runAnimation } =
    useAllowAnimation(ANIMATION_TIME);

  const isActive = value === "true";

  const mainRef = useRef<HTMLButtonElement>(null);
  // Point where click happened in % relative to button box. Used for animation
  const [clickPoint, setClickPoint] = useState([50, 50]);
  // Ration between width and height of the box.
  const [_whRatio, setWhRatio] = useState(1);

  const handleClick = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (mainRef.current) {
      runAnimation();
      const t = mainRef.current;
      const rect = t.getBoundingClientRect();
      if (e.clientX === 0 && e.clientY === 0) {
        // keyboard click
        setClickPoint([50, 50]);
      } else {
        const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
        const y = clamp((e.clientY - rect.top) / rect.height, 0, 1);
        setClickPoint([x * 100, y * 100]);
      }
      setWhRatio(rect.height / rect.width);
    } else {
      console.warn("DayCellBoolean animation error");
    }

    const newVal = isActive ? "false" : "true";

    await onChange({ value: newVal, recordId });
  };

  return (
    <>
      <button
        data-value={isActive}
        ref={mainRef}
        tabIndex={0}
        className={cn(
          DayCellBaseClasses,
          DayCellBaseClassesFocus,
          "transition-all duration-200 ease-in-out",
          isActive
            ? "border-[var(--themeActiveLight)] hover:border-[var(--themeInactiveLight)] dark:border-[var(--themeActiveDark)] dark:hover:border-[var(--themeInactiveDark)]"
            : "border-[var(--themeInactiveLight)] hover:border-[var(--themeActiveLight)] dark:border-[var(--themeInactiveDark)] dark:hover:border-[var(--themeActiveDark)]",
          isActive
            ? "bg-[var(--themeActiveLight)] dark:bg-[var(--themeActiveDark)]"
            : "bg-[var(--themeInactiveLight)] dark:bg-[var(--themeInactiveDark)]",
        )}
        style={
          {
            "--themeActiveLight": themeActiveLight,
            "--themeActiveDark": themeActiveDark,
            "--themeInactiveLight": themeInactiveLight,
            "--themeInactiveDark": themeInactiveDark,
            "--animation-time": `${ANIMATION_TIME * animationMultiplier}s`,
          } as CSSProperties
        }
        onClick={(e) => void handleClick(e)}
      >
        {labelType === "auto" && <LabelInside />}
      </button>
    </>
  );
};
