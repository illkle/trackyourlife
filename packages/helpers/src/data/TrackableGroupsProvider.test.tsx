import React, { memo } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { DbTrackableGroupSelect } from "@tyl/db/client/schema-powersync";

import { TrackableGroupsProvider, useIsTrackableInGroup } from "./TrackableGroupsProvider";

const makeGroup = (overrides: Partial<DbTrackableGroupSelect>): DbTrackableGroupSelect => ({
  id: "group-1",
  user_id: "user-1",
  trackable_id: "trackable-1",
  group: "group-a",
  ...overrides,
});

describe("TrackableGroupsProvider", () => {
  it("only re-renders consumers whose group membership changed", () => {
    const firstRenderSpy = vi.fn();
    const secondRenderSpy = vi.fn();

    const FirstConsumer = memo(() => {
      const value = useIsTrackableInGroup("trackable-1", "group-a");
      firstRenderSpy(value);
      return <div data-testid="first">{String(value)}</div>;
    });

    const SecondConsumer = memo(() => {
      const value = useIsTrackableInGroup("trackable-2", "group-b");
      secondRenderSpy(value);
      return <div data-testid="second">{String(value)}</div>;
    });

    const initialGroups = [
      makeGroup({ id: "group-1", trackable_id: "trackable-1", group: "group-a" }),
      makeGroup({ id: "group-2", trackable_id: "trackable-2", group: "group-b" }),
    ];

    const { rerender } = render(
      <TrackableGroupsProvider groupsSelect={initialGroups}>
        <FirstConsumer />
        <SecondConsumer />
      </TrackableGroupsProvider>,
    );

    expect(firstRenderSpy).toHaveBeenCalledTimes(1);
    expect(secondRenderSpy).toHaveBeenCalledTimes(1);

    const updatedGroups = [makeGroup({ id: "group-2", trackable_id: "trackable-2", group: "group-b" })];

    rerender(
      <TrackableGroupsProvider groupsSelect={updatedGroups}>
        <FirstConsumer />
        <SecondConsumer />
      </TrackableGroupsProvider>,
    );

    expect(firstRenderSpy).toHaveBeenCalledTimes(2);
    expect(secondRenderSpy).toHaveBeenCalledTimes(1);
  });
});
