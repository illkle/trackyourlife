import { addMinutes, startOfDay, startOfHour, startOfMinute } from "date-fns";
import { useSyncExternalStore } from "react";

export type ClockGranularity = "day" | "hour" | "minute";

type Listener = () => void;

type ClockState = {
  now: Date;
  dayBucket: number;
  hourBucket: number;
  minuteBucket: number;
  listeners: Record<ClockGranularity, Set<Listener>>;
  timer: ReturnType<typeof setTimeout> | null;
};

const getDayBucket = (date: Date) => startOfDay(date).getTime();
const getHourBucket = (date: Date) => startOfHour(date).getTime();
const getMinuteBucket = (date: Date) => startOfMinute(date).getTime();

const initialNow = new Date();

const clockState: ClockState = {
  now: initialNow,
  dayBucket: getDayBucket(initialNow),
  hourBucket: getHourBucket(initialNow),
  minuteBucket: getMinuteBucket(initialNow),
  listeners: {
    day: new Set(),
    hour: new Set(),
    minute: new Set(),
  },
  timer: null,
};

const hasListeners = () => {
  return (
    clockState.listeners.day.size > 0 ||
    clockState.listeners.hour.size > 0 ||
    clockState.listeners.minute.size > 0
  );
};

const emit = (granularity: ClockGranularity) => {
  for (const listener of clockState.listeners[granularity]) {
    listener();
  }
};

const applyDateUpdate = (nextNow: Date) => {
  const nextDayBucket = getDayBucket(nextNow);
  const nextHourBucket = getHourBucket(nextNow);
  const nextMinuteBucket = getMinuteBucket(nextNow);

  const dayChanged = nextDayBucket !== clockState.dayBucket;
  const hourChanged = nextHourBucket !== clockState.hourBucket;
  const minuteChanged = nextMinuteBucket !== clockState.minuteBucket;

  if (!dayChanged && !hourChanged && !minuteChanged) {
    return;
  }

  clockState.now = nextNow;
  clockState.dayBucket = nextDayBucket;
  clockState.hourBucket = nextHourBucket;
  clockState.minuteBucket = nextMinuteBucket;

  if (minuteChanged) {
    emit("minute");
  }
  if (hourChanged) {
    emit("hour");
  }
  if (dayChanged) {
    emit("day");
  }
};

const clearClockTimer = () => {
  if (!clockState.timer) {
    return;
  }

  clearTimeout(clockState.timer);
  clockState.timer = null;
};

const scheduleNextTick = () => {
  clearClockTimer();

  if (!hasListeners()) {
    return;
  }

  const now = new Date();
  const nextMinute = addMinutes(startOfMinute(now), 1);
  const delay = Math.max(0, nextMinute.getTime() - now.getTime() + 10);

  clockState.timer = setTimeout(() => {
    applyDateUpdate(new Date());
    scheduleNextTick();
  }, delay);
};

export const subscribeToNow = (granularity: ClockGranularity, listener: Listener) => {
  clockState.listeners[granularity].add(listener);
  applyDateUpdate(new Date());
  scheduleNextTick();

  return () => {
    clockState.listeners[granularity].delete(listener);
    if (!hasListeners()) {
      clearClockTimer();
    }
  };
};

export const getNowSnapshot = () => clockState.now;

export const refreshNow = () => {
  applyDateUpdate(new Date());
  if (hasListeners()) {
    scheduleNextTick();
  }
};

export const useNow = (granularity: ClockGranularity = "minute") => {
  return useSyncExternalStore(
    (listener) => subscribeToNow(granularity, listener),
    getNowSnapshot,
    getNowSnapshot,
  );
};

export const useNowMinute = () => useNow("minute");

export const useNowHour = () => useNow("hour");

export const useNowDay = () => useNow("day");
