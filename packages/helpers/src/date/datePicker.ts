import {
  addMonths,
  clamp,
  getDaysInMonth,
  getISODay,
  isAfter,
  isBefore,
  isSameMonth,
  startOfMonth,
} from "date-fns";

export type DatePickerLimits = {
  start: Date;
  end: Date;
};

export const getDefaultDatePickerLimits = (): DatePickerLimits => {
  return {
    start: new Date(2000, 0, 1),
    end: new Date(2040, 0, 1),
  };
};

export const getInitialDatePickerCursor = (date?: Date, fallbackDate = new Date()) => {
  return startOfMonth(date ?? fallbackDate);
};

export const moveDatePickerCursorByMonths = (
  cursor: Date,
  monthDelta: number,
  limits: DatePickerLimits,
) => {
  return clamp(addMonths(cursor, monthDelta), limits);
};

export const isDateWithinLimits = (date: Date, limits: DatePickerLimits) => {
  return !isBefore(date, limits.start) && !isAfter(date, limits.end);
};

export const getDatePickerMonthData = (cursor: Date) => {
  const daysInMonth = getDaysInMonth(cursor);
  const dates = Array.from({ length: daysInMonth }, (_, index) => index + 1);

  const firstDayDate = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const prependCount = getISODay(firstDayDate) - 1;
  const prepend = Array.from({ length: prependCount }, () => 0);

  return {
    dates,
    prepend,
  };
};

export const isCursorAtLimitMonth = (cursor: Date, limitDate: Date) => {
  return isSameMonth(cursor, limitDate);
};
