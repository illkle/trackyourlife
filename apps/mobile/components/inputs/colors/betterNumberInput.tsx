import { useEffect, useState } from "react";

import { clamp } from "@tyl/helpers/animation";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
  const [internalValue, setInternalValue] = useState(String(value));
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setInternalValue(String(value));
  }, [value]);

  return (
    <Input
      className={cn("h-9 px-2 text-center", isError && "border-destructive", className)}
      keyboardType="numeric"
      value={internalValue}
      onChangeText={(text) => {
        if (text === "") {
          setInternalValue("");
          return;
        }

        const numberValue = Number(text);
        if (Number.isNaN(numberValue)) {
          setInternalValue(text);
          setIsError(true);
          return;
        }

        const clamped = clamp(numberValue, limits.min, limits.max);

        if (hardLimits) {
          setInternalValue(String(clamped));
          onChange(clamped);
          setIsError(false);
          return;
        }

        setInternalValue(text);
        if (clamped !== numberValue) {
          setIsError(true);
          return;
        }

        setIsError(false);
        onChange(clamped);
      }}
      onBlur={() => {
        setIsError(false);
        const numberValue = Number(internalValue);
        if (Number.isNaN(numberValue)) {
          setInternalValue(String(value));
          return;
        }

        const clamped = clamp(numberValue, limits.min, limits.max);
        onChange(clamped);
        setInternalValue(String(clamped));
      }}
    />
  );
};
