import React, { memo } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { parseISO } from "date-fns";

import type { DbTrackableRecordSelect } from "@tyl/db/client/schema-powersync";

import { TrackableDataProvider, useTrackableDataFromContext } from "./TrackableDataProvider";

const makeRecord = (overrides: Partial<DbTrackableRecordSelect>): DbTrackableRecordSelect => ({
  id: "record-1",
  user_id: "user-1",
  timestamp: "2025-01-01T12:00:00",
  time_bucket: null,
  trackable_id: "trackable-1",
  value: "1",
  external_key: "external-1",
  updated_at: 1,
  ...overrides,
});

describe("TrackableDataProvider", () => {
  it("only re-renders consumers whose data changed", () => {
    const firstRenderSpy = vi.fn();
    const secondRenderSpy = vi.fn();

    const dateOne = parseISO("2025-01-01T12:00:00");
    const dateTwo = parseISO("2025-01-02T12:00:00");

    const FirstConsumer = memo(() => {
      const value = useTrackableDataFromContext("trackable-1", dateOne);
      firstRenderSpy(value);
      return <div data-testid="first">{value.length}</div>;
    });

    const SecondConsumer = memo(() => {
      const value = useTrackableDataFromContext("trackable-2", dateTwo);
      secondRenderSpy(value);
      return <div data-testid="second">{value.length}</div>;
    });

    const r2 = makeRecord({
      id: "record-2",
      trackable_id: "trackable-2",
      timestamp: "2025-01-02T12:00:00",
      value: "two",
      updated_at: 1,
    });

    const initialRecords = [
      makeRecord({ id: "record-1", trackable_id: "trackable-1", value: "one", updated_at: 1 }),
      r2,
    ];

    const { rerender } = render(
      <TrackableDataProvider recordsSelect={initialRecords}>
        <FirstConsumer />
        <SecondConsumer />
      </TrackableDataProvider>,
    );

    expect(firstRenderSpy).toHaveBeenCalledTimes(1);
    expect(secondRenderSpy).toHaveBeenCalledTimes(1);

    const updatedRecords = [
      makeRecord({ id: "record-1", trackable_id: "trackable-1", value: "updated", updated_at: 1 }),
      r2,
    ];

    rerender(
      <TrackableDataProvider recordsSelect={updatedRecords}>
        <FirstConsumer />
        <SecondConsumer />
      </TrackableDataProvider>,
    );

    expect(firstRenderSpy).toHaveBeenCalledTimes(2);
    expect(secondRenderSpy).toHaveBeenCalledTimes(1);
  });
});
