import { afterEach, describe, expect, it, vi } from "vitest";

const loadStoreAt = async (date: Date) => {
  vi.resetModules();
  vi.setSystemTime(date);
  return import("./clockStore");
};

describe("clockStore", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("notifies minute subscribers only on minute boundary", async () => {
    vi.useFakeTimers();
    const store = await loadStoreAt(new Date(2026, 0, 1, 10, 0, 30, 0));

    let minuteCalls = 0;
    const unsubscribe = store.subscribeToNow("minute", () => {
      minuteCalls += 1;
    });

    vi.advanceTimersByTime(29_000);
    expect(minuteCalls).toBe(0);

    vi.advanceTimersByTime(1_500);
    expect(minuteCalls).toBe(1);

    unsubscribe();
  });

  it("notifies hour subscribers when hour changes", async () => {
    vi.useFakeTimers();
    const store = await loadStoreAt(new Date(2026, 0, 1, 10, 59, 30, 0));

    let minuteCalls = 0;
    let hourCalls = 0;
    let dayCalls = 0;

    const unsubscribeMinute = store.subscribeToNow("minute", () => {
      minuteCalls += 1;
    });
    const unsubscribeHour = store.subscribeToNow("hour", () => {
      hourCalls += 1;
    });
    const unsubscribeDay = store.subscribeToNow("day", () => {
      dayCalls += 1;
    });

    vi.advanceTimersByTime(31_000);

    expect(minuteCalls).toBe(1);
    expect(hourCalls).toBe(1);
    expect(dayCalls).toBe(0);

    unsubscribeMinute();
    unsubscribeHour();
    unsubscribeDay();
  });

  it("notifies day subscribers on day rollover", async () => {
    vi.useFakeTimers();
    const store = await loadStoreAt(new Date(2026, 0, 1, 23, 59, 30, 0));

    let dayCalls = 0;
    const unsubscribe = store.subscribeToNow("day", () => {
      dayCalls += 1;
    });

    vi.advanceTimersByTime(31_000);
    expect(dayCalls).toBe(1);

    unsubscribe();
  });

  it("refreshNow emits immediately when bucket changed", async () => {
    vi.useFakeTimers();
    const store = await loadStoreAt(new Date(2026, 0, 1, 12, 0, 0, 0));

    let dayCalls = 0;
    const unsubscribe = store.subscribeToNow("day", () => {
      dayCalls += 1;
    });

    vi.setSystemTime(new Date(2026, 0, 2, 8, 0, 0, 0));
    store.refreshNow();

    expect(dayCalls).toBe(1);
    expect(store.getNowSnapshot().getDate()).toBe(2);

    unsubscribe();
  });

  it("refreshes snapshot when listeners are re-added after long pause", async () => {
    vi.useFakeTimers();
    const store = await loadStoreAt(new Date(2026, 0, 1, 10, 0, 10, 0));

    const stopInitialListener = store.subscribeToNow("minute", () => {
      // no-op
    });
    stopInitialListener();

    vi.setSystemTime(new Date(2026, 0, 1, 15, 45, 10, 0));

    let reAddedListenerCalls = 0;
    const stopReAddedListener = store.subscribeToNow("minute", () => {
      reAddedListenerCalls += 1;
    });

    expect(store.getNowSnapshot().getHours()).toBe(15);
    expect(store.getNowSnapshot().getMinutes()).toBe(45);
    expect(reAddedListenerCalls).toBe(1);

    vi.advanceTimersByTime(51_000);
    expect(store.getNowSnapshot().getMinutes()).toBe(46);
    expect(reAddedListenerCalls).toBe(2);

    stopReAddedListener();
  });
});
