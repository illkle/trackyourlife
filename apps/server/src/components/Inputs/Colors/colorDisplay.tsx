import type { CSSProperties } from "react";
import { cn } from "@shad/lib/utils";
import { MoonIcon, SunIcon } from "lucide-react";

import type { IColorValue } from "@tyl/db/jsonValidators";
import { presetsArray } from "@tyl/helpers/colorPresets";
import { makeColorString } from "@tyl/helpers/colorTools";

export const ColorDisplay = ({
  color,
  className,
  style,
}: {
  color: IColorValue;
  className?: string;
  style?: CSSProperties;
}) => {
  const currentLight = makeColorString(color.lightMode);
  const currentDark = makeColorString(color.darkMode);

  return (
    <div
      className={cn(
        "relative flex w-full items-center overflow-hidden rounded-md border-2 border-neutral-200 bg-transparent font-mono text-sm shadow-xs transition-colors focus-visible:ring-1 focus-visible:ring-neutral-950 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800",
        className,
      )}
      style={style}
    >
      <SunIcon
        size={16}
        className="absolute top-1/2 left-2 z-20 -translate-y-1/2 stroke-neutral-950"
      />
      <MoonIcon
        size={16}
        className="absolute top-1/2 right-2 z-20 -translate-y-1/2 stroke-neutral-50"
      />
      <div
        className="absolute top-0 left-1/2 z-10 h-full w-full"
        style={{
          background: currentDark,
          // Manual transform because order matters
          transform: "rotate(35deg) scale(10)",
          transformOrigin: "left",
        }}
      ></div>
      <div
        className="absolute top-0 left-0 h-full w-full"
        style={{ background: currentLight }}
      ></div>
    </div>
  );
};

export const Presets = ({
  setColor,
  className,
}: {
  savedColor: IColorValue;
  setColor: (v: IColorValue) => void;
  className?: string;
}) => {
  return (
    <div className={cn("grid grid-cols-8 gap-1", className)}>
      {presetsArray.map((col, index) => {
        return (
          <button key={index} onClick={() => setColor(col)}>
            <ColorDisplay color={col} />
          </button>
        );
      })}
    </div>
  );
};
