import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounceCallback, useUnmount } from "usehooks-ts";

/**
 * Hook that allows efficient bidirectionall link between a controlled input and a db record.
 * It will update internal state and propagate changes to the parent onChange function.
 * However if a parent's value changes from somewhere else the value will update.
 * It uses a change timestamp stored somewhere inside value to determine why parent changed and how fresh the update is.
 *
 * @param value - Value in db or some other higher storage
 * @param onChange - Function to call when value changes. Receives value and timestamp.
 * @param timestamp - When value was last updated.
 * @param throttleTime - How often to call onChange, ms
 */
export const useLinkedValue = <T>({
  value,
  onChange,
  timestamp,
  alwaysUpdate = false,
  throttleTime = 300,
}: {
  value: T;
  onChange: (v: T, timestamp: number) => void;
  timestamp?: number;
  alwaysUpdate?: boolean;
  throttleTime?: number;
  outputTransform?: (v: T) => T;
  inputTransform?: (v: T) => T;
}) => {
  const [internalValue, setInternalValue] = useState<T>(value);

  const ourTimestamp = useRef(timestamp);

  const debouncedOnChange = useDebounceCallback(onChange, throttleTime);

  useEffect(() => {
    if (alwaysUpdate) {
      setInternalValue(value);
    } else if (
      !ourTimestamp.current ||
      (timestamp && timestamp > ourTimestamp.current)
    ) {
      setInternalValue(value);
      ourTimestamp.current = timestamp;
    } else {
      console.log("skip updates");
    }
  }, [value, timestamp, alwaysUpdate]);

  useUnmount(() => {
    debouncedOnChange.flush();
  });

  const updateHandler = useCallback(
    (v: T) => {
      setInternalValue(v);
      ourTimestamp.current = new Date().getTime();
      debouncedOnChange(v, ourTimestamp.current);
    },
    [debouncedOnChange],
  );

  return { internalValue, updateHandler };
};
