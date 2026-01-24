import React, { memo } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { DbTrackableFlagsSelect } from "@tyl/db/client/schema-powersync";

import { TrackableFlagsProviderExternal, useTrackableFlag } from "./TrackableFlagsProvider";

const makeFlag = (overrides: Partial<DbTrackableFlagsSelect>): DbTrackableFlagsSelect => ({
  id: "flag-1",
  user_id: "user-1",
  trackable_id: "trackable-1",
  key: "AnyNote",
  value: JSON.stringify("note"),
  ...overrides,
});

describe("TrackableFlagsProviderExternal", () => {
  it("only re-renders consumers whose flag changed", () => {
    const noteRenderSpy = vi.fn();
    const colorRenderSpy = vi.fn();

    const NoteConsumer = memo(() => {
      const value = useTrackableFlag("trackable-1", "AnyNote");
      noteRenderSpy(value);
      return <div data-testid="note">{String(value)}</div>;
    });

    const ColorConsumer = memo(() => {
      const value = useTrackableFlag("trackable-1", "NumberColorCoding");
      colorRenderSpy(value);
      return <div data-testid="color">{String(Boolean(value))}</div>;
    });

    const initialFlags = [
      makeFlag({ id: "flag-1", key: "AnyNote", value: JSON.stringify("hello") }),
      makeFlag({
        id: "flag-2",
        key: "NumberColorCoding",
        value: JSON.stringify({ enabled: false, colors: [] }),
      }),
    ];

    const { rerender } = render(
      <TrackableFlagsProviderExternal flagsSelect={initialFlags}>
        <NoteConsumer />
        <ColorConsumer />
      </TrackableFlagsProviderExternal>,
    );

    expect(noteRenderSpy).toHaveBeenCalledTimes(1);
    expect(colorRenderSpy).toHaveBeenCalledTimes(1);

    const updatedFlags = [
      makeFlag({ id: "flag-1", key: "AnyNote", value: JSON.stringify("updated") }),
      makeFlag({
        id: "flag-2",
        key: "NumberColorCoding",
        value: JSON.stringify({ enabled: false, colors: [] }),
      }),
    ];

    rerender(
      <TrackableFlagsProviderExternal flagsSelect={updatedFlags}>
        <NoteConsumer />
        <ColorConsumer />
      </TrackableFlagsProviderExternal>,
    );

    expect(noteRenderSpy).toHaveBeenCalledTimes(2);
    expect(colorRenderSpy).toHaveBeenCalledTimes(1);
  });
});
