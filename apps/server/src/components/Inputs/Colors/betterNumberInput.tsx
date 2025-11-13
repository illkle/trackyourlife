import { useState } from "react";
import { cn } from "@shad/lib/utils";
import { useIsomorphicLayoutEffect } from "usehooks-ts";

import { clamp } from "@tyl/helpers/animation";

import { Input } from "~/@shad/custom/input-w-details";

export const BetterNumberInput = ({
  value,
  onChange,
  limits = { min: 0, max: 255 },
  className,
  hardLimits = false,
}: {
  value: number;
  limits?: { min: number; max: number };
  onChange: (v: number) => void;
  className?: string;
  hardLimits?: boolean;
}) => {
  const [internalValue, setInternalVal] = useState<number | string>(value);

  useIsomorphicLayoutEffect(() => {
    setInternalVal(value);
  }, [value]);

  const [isError, setIsError] = useState(false);

  return (
    <Input
      className={cn("w-full text-center max-sm:p-0", className)}
      type="number"
      error={isError}
      value={internalValue}
      onChange={(e) => {
        // This code allows input to be empty when editing
        if (Number.isNaN(e.target.valueAsNumber)) {
          setInternalVal("");
          return;
        }

        const clamped = clamp(e.target.valueAsNumber, limits.min, limits.max);

        if (hardLimits) {
          setInternalVal(clamped);
          onChange(clamped);
          setIsError(false);
        } else {
          setInternalVal(e.target.valueAsNumber);

          if (clamped !== e.target.valueAsNumber) {
            setIsError(true);
            return;
          }

          onChange(clamped);
          setIsError(false);
        }
      }}
      onBlur={() => {
        setIsError(false);
        setInternalVal(value);
        if (Number.isNaN(internalValue) || typeof internalValue === "string") {
          return;
        }
        onChange(clamp(internalValue, limits.min, limits.max));
      }}
    />
  );
};
