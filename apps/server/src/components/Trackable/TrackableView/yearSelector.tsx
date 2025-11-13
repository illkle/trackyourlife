import { useState } from "react";
import { cn } from "@shad/lib/utils";
import { useIsomorphicLayoutEffect } from "usehooks-ts";

import { Input } from "~/@shad/components/input";

export const YearSelector = ({
  value,
  onChange,
  className,
  onBlur,
  onFocus,
}: {
  value?: number;
  onChange: (v: number) => void;
  className?: string;
  onBlur?: () => void;
  onFocus?: () => void;
}) => {
  const [valueInternal, setValueInternal] = useState(String(value));

  useIsomorphicLayoutEffect(() => {
    if (String(value) !== valueInternal) {
      setValueInternal(String(value));
    }
  }, [value]);

  const blurHander = () => {
    handleRealSave();
    onBlur?.();
  };

  const handleRealSave = () => {
    const n = Number(valueInternal);
    if (Number.isNaN(n) || n < 1970 || n > 3000) {
      setValueInternal(String(value));
      return;
    }

    onChange(n);
  };

  if (!value) return <></>;

  return (
    <Input
      value={valueInternal}
      onChange={(e) => setValueInternal(e.target.value)}
      onBlur={blurHander}
      onFocus={onFocus}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
          handleRealSave();
        }
      }}
      className={cn(
        "peer relative z-10 h-auto w-16 border-transparent bg-transparent p-0 text-center leading-none dark:bg-transparent",
        className,
      )}
    />
  );
};
