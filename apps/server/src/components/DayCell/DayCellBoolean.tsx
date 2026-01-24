import type { CSSProperties, MouseEvent } from "react";
import { useRef } from "react";
import { cn } from "@shad/lib/utils";

import {
  DayCellBaseClasses,
  DayCellBaseClassesFocus,
  LabelInside,
  IDayCellProps,
} from "~/components/DayCell";
import { useTrackableFlag } from "@tyl/helpers/data/TrackableFlagsProvider";
import { useTrackableMeta } from "@tyl/helpers/data/TrackableMetaProvider";

const BooleanUI = ({
  value,
  onChange,
  themeActiveLight,
  themeActiveDark,
  themeInactiveLight,
  themeInactiveDark,
  children,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  themeActiveLight: string;
  themeActiveDark: string;
  themeInactiveLight: string;
  themeInactiveDark: string;
  children: React.ReactNode;
}) => {
  const mainRef = useRef<HTMLButtonElement>(null);
  // Point where click happened in % relative to button box. Used for animation

  const handleClick = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    await onChange(!value);
  };

  return (
    <button
      data-boolean-cell
      data-value={value}
      ref={mainRef}
      tabIndex={0}
      className={cn(
        DayCellBaseClasses,
        DayCellBaseClassesFocus,
        value
          ? "border-(--themeActiveLight) hover:border-(--themeInactiveLight) dark:border-(--themeActiveDark) dark:hover:border-(--themeInactiveDark)"
          : "border-(--themeInactiveLight) hover:border-(--themeActiveLight) dark:border-(--themeInactiveDark) dark:hover:border-(--themeActiveDark)",
        value
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
      {children}
    </button>
  );
};

export const DayCellBoolean = (props: IDayCellProps) => {
  const { id } = useTrackableMeta();

  const { labelType, onChange, values } = props.cellData;
  const { value, id: recordId } = values[0] ?? {};

  const { lightMode: themeActiveLight, darkMode: themeActiveDark } = useTrackableFlag(
    id,
    "BooleanCheckedColor",
  );
  const { lightMode: themeInactiveLight, darkMode: themeInactiveDark } = useTrackableFlag(
    id,
    "BooleanUncheckedColor",
  );

  return (
    <BooleanUI
      value={value === "true"}
      onChange={(v) => void onChange({ value: v ? "true" : "false", recordId })}
      themeActiveLight={themeActiveLight}
      themeActiveDark={themeActiveDark}
      themeInactiveLight={themeInactiveLight}
      themeInactiveDark={themeInactiveDark}
    >
      {labelType === "auto" && <LabelInside cellData={props.cellData} />}
    </BooleanUI>
  );
};
