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
  validate,
  alwaysUpdate = false,
  throttleTime = 300,
}: {
  value: T;
  onChange: (v: T, timestamp: number) => void | Promise<void>;
  validate?: (v: T) => boolean;
  timestamp?: number;
  alwaysUpdate?: boolean;
  throttleTime?: number;
}) => {
  const [internalValue, setInternalValue] = useState<T>(value);
  const [internalValueValidated, setInternalValueValidated] =
    useState<T>(value);

  const ourTimestamp = useRef(timestamp);

  const debouncedOnChange = useDebounceCallback(onChange, throttleTime);

  useEffect(() => {
    if (alwaysUpdate) {
      setInternalValue(value);
      setInternalValueValidated(value);
    } else if (
      !ourTimestamp.current ||
      (timestamp && timestamp > ourTimestamp.current)
    ) {
      setInternalValue(value);
      setInternalValueValidated(value);
      ourTimestamp.current = timestamp;
    }
  }, [value, timestamp, alwaysUpdate]);

  useUnmount(() => {
    debouncedOnChange.flush();
  });

  const updateHandler = useCallback(
    async (v: T) => {
      setInternalValue(v);
      if (!validate || validate(v)) {
        ourTimestamp.current = Date.now();
        await debouncedOnChange(v, ourTimestamp.current);
        setInternalValueValidated(v);
      }
    },
    [debouncedOnChange, validate],
  );

  const reset = useCallback(() => {
    setInternalValue(value);
    ourTimestamp.current = timestamp;
  }, [value, timestamp]);

  return {
    internalValue,
    updateHandler,
    reset,
    internalValueValidated,
    flush: debouncedOnChange.flush,
  };
};

export const useLinkedBinding = <T>({
  dbState,
  dbOnChange,
  dbTimestamp,
  alwaysUpdate = false,
  setInternalValue,
  throttleTime = 300,
}: {
  dbState: T;
  dbTimestamp?: number;
  setInternalValue: (v: T) => void;
  dbOnChange: (v: T, timestamp: number) => void | Promise<void>;

  alwaysUpdate?: boolean;
  throttleTime?: number;
}) => {
  const ourTimestamp = useRef(dbTimestamp);

  const debouncedOnChange = useDebounceCallback(dbOnChange, throttleTime);

  useEffect(() => {
    if (alwaysUpdate) {
      setInternalValue(dbState);
    } else if (
      !ourTimestamp.current ||
      (dbTimestamp && dbTimestamp > ourTimestamp.current)
    ) {
      setInternalValue(dbState);
      ourTimestamp.current = dbTimestamp;
    }
  }, [dbState, dbTimestamp, alwaysUpdate, setInternalValue]);

  useUnmount(() => {
    debouncedOnChange.flush();
  });

  const updateHandler = useCallback(
    async (v: T) => {
      setInternalValue(v);
      ourTimestamp.current = Date.now();
      await debouncedOnChange(v, ourTimestamp.current);
    },
    [debouncedOnChange, setInternalValue],
  );

  const reset = useCallback(() => {
    setInternalValue(dbState);
    ourTimestamp.current = dbTimestamp;
  }, [dbState, dbTimestamp, setInternalValue]);

  return {
    updateHandler,
    reset,
    flush: debouncedOnChange.flush,
  };
};
