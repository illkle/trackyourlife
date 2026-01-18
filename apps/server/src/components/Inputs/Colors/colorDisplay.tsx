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
        "relative flex w-full items-center overflow-hidden rounded-md border-2 border-border bg-transparent font-mono text-sm shadow-xs transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      style={style}
    >
      {/* Has to be black\white because we need same colors in both dark and light mode */}
      <SunIcon size={16} className="absolute top-1/2 left-2 z-20 -translate-y-1/2 stroke-black" />
      <MoonIcon size={16} className="absolute top-1/2 right-2 z-20 -translate-y-1/2 stroke-white" />
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
