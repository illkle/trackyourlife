import { useState } from "react";
import { cn } from "@shad/utils";

import type { INumberSettings } from "@tyl/db/jsonValidators";

import { Input } from "~/@shad/components/input";

export interface IRangeLabelSelector {
  value: INumberSettings["progress"];
  onChange: (a: INumberSettings["progress"]) => void;
  className?: string;
}

const NumberLimitsSelector = ({
  value,
  onChange,
  className,
}: IRangeLabelSelector) => {
  const [innerMin, setInnerMin] = useState(String(value?.min ?? "0"));
  const [innerMax, setInnerMax] = useState(String(value?.max ?? "100"));

  const [isError, setIsError] = useState(false);

  const checkValidityAndPush = (min: number, max: number) => {
    if (
      typeof min === "number" &&
      typeof max === "number" &&
      !isNaN(min) &&
      !isNaN(max) &&
      max > min
    ) {
      setIsError(false);
      onChange({ min, max });
      return;
    }
    setIsError(true);
  };

  return (
    <div
      className={cn(
        "grid w-fit grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-x-3",
        className,
      )}
    >
      <div className="w-52 text-neutral-400 dark:text-neutral-500">0%</div>
      <div className="w-52 text-neutral-400 dark:text-neutral-500 max-sm:row-start-3 max-sm:row-end-3">
        100%
      </div>
      <Input
        className="w-52"
        value={innerMin}
        onChange={(e) => {
          if (e.target.value === "-" || e.target.value === "") {
            setInnerMin(e.target.value);
          } else {
            if (Number.isNaN(e.target.valueAsNumber)) return;
            setInnerMin(String(e.target.valueAsNumber));
            checkValidityAndPush(e.target.valueAsNumber, Number(innerMax));
          }
        }}
        error={isError}
        type="number"
      />
      <Input
        className="w-52"
        value={innerMax}
        onChange={(e) => {
          if (e.target.value === "-" || e.target.value === "") {
            setInnerMax(e.target.value);
          } else {
            if (Number.isNaN(e.target.valueAsNumber)) return;
            setInnerMax(String(e.target.valueAsNumber));
            checkValidityAndPush(Number(innerMin), e.target.valueAsNumber);
          }
        }}
        error={isError}
        type="number"
      />
    </div>
  );
};
export default NumberLimitsSelector;
