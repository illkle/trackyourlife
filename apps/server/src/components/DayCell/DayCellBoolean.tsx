import type { CSSProperties, MouseEvent } from "react";
import { useRef, useState } from "react";
import { cn } from "@shad/lib/utils";

import { clamp } from "@tyl/helpers";

import {
  DayCellBaseClasses,
  DayCellBaseClassesFocus,
  LabelInside,
  useDayCellContext,
} from "~/components/DayCell";
import { useTrackableFlag } from "@tyl/helpers/data/TrackableFlagsProvider";
import { useTrackableMeta } from "~/components/Trackable/TrackableProviders/TrackableProvider";

export const DayCellBoolean = () => {
  const { id } = useTrackableMeta();

  const { labelType, onChange, values } = useDayCellContext();
  const { value, recordId } = values[0] ?? {};

  const { lightMode: themeActiveLight, darkMode: themeActiveDark } = useTrackableFlag(
    id,
    "BooleanCheckedColor",
  );
  const { lightMode: themeInactiveLight, darkMode: themeInactiveDark } = useTrackableFlag(
    id,
    "BooleanUncheckedColor",
  );

  // Even though we're not using any values from context it's useful to check whether it's provided

  const isActive = value === "true";

  const mainRef = useRef<HTMLButtonElement>(null);
  // Point where click happened in % relative to button box. Used for animation
  const [_, setClickPoint] = useState([50, 50]);
  // Ration between width and height of the box.
  const [_whRatio, setWhRatio] = useState(1);

  const handleClick = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (mainRef.current) {
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
        data-boolean-cell
        data-value={isActive}
        ref={mainRef}
        tabIndex={0}
        className={cn(
          DayCellBaseClasses,
          DayCellBaseClassesFocus,
          isActive
            ? "border-(--themeActiveLight) hover:border-(--themeInactiveLight) dark:border-(--themeActiveDark) dark:hover:border-(--themeInactiveDark)"
            : "border-(--themeInactiveLight) hover:border-(--themeActiveLight) dark:border-(--themeInactiveDark) dark:hover:border-(--themeActiveDark)",
          isActive
            ? "bg-(--themeActiveLight) dark:bg-(--themeActiveDark)"
            : "bg-(--themeInactiveLight) dark:bg-(--themeInactiveDark)",
        )}
        style={
          {
            "--themeActiveLight": themeActiveLight,
            "--themeActiveDark": themeActiveDark,
            "--themeInactiveLight": themeInactiveLight,
            "--themeInactiveDark": themeInactiveDark,
          } as CSSProperties
        }
        onClick={(e) => void handleClick(e)}
      >
        {labelType === "auto" && <LabelInside />}
      </button>
    </>
  );
};
