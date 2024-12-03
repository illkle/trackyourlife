import type { CSSProperties } from "react";
import { cn } from "@shad/utils";
import { MoonIcon, SunIcon } from "lucide-react";

import type { IColorValue } from "@tyl/validators/trackable";
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
        "relative flex h-9 w-full items-center overflow-hidden rounded-md border-2 border-neutral-200 bg-transparent font-mono text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800",
        className,
      )}
      style={style}
    >
      <SunIcon
        size={16}
        className="absolute left-2 top-1/2 z-20 -translate-y-1/2 stroke-neutral-950"
      />
      <MoonIcon
        size={16}
        className="absolute right-2 top-1/2 z-20 -translate-y-1/2 stroke-neutral-50"
      />
      <div
        className="absolute left-1/2 top-0 z-10 h-full w-full"
        style={{
          background: currentDark,
          // Manual transform because order matters
          transform: "rotate(35deg) scale(10)",
          transformOrigin: "left",
        }}
      ></div>
      <div
        className="absolute left-0 top-0 h-full w-full"
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
