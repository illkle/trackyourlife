import { Fragment, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Button } from "~/@shad/components/button";
import { Input } from "~/@shad/components/input";
import {
  TrackableFlagsProvider,
  useSetTrackableFlag,
  useTrackableFlag,
} from "~/components/Trackable/TrackableProviders/TrackableFlagsProvider";
import { useZeroTrackablesList } from "~/utils/useZ";

export const Route = createFileRoute("/app/testing")({
  component: RouteComponent,
});

function RouteComponent() {
  const [data] = useZeroTrackablesList();

  return (
    <div className="class flex flex-col">
      <TrackableFlagsProvider trackableIds={data.map((t) => t.id)}>
        <div className="flex">
          <div className="p-4">
            {data.map((t) => (
              <Fragment key={t.id}>
                <FlagTester id={t.id} />
                <FlagTesterB id={t.id} />
              </Fragment>
            ))}
          </div>
          <div className="p-4">
            {data.map((t) => (
              <Fragment key={t.id}>
                <FlagTester id={t.id} />
                <FlagTesterB id={t.id} />
              </Fragment>
            ))}
          </div>
        </div>
      </TrackableFlagsProvider>
    </div>
  );
}

const FlagTester = ({ id }: { id: string }) => {
  const v2 = useTrackableFlag(id, "AnyTestFlag");
  const setFlag = useSetTrackableFlag();
  const tempValue = useRef("");

  return (
    <div className="flex flex-col gap-2 p-4">
      <div>{id}</div>
      <div className="flex gap-2">
        <Input
          defaultValue={v2}
          onChange={(e) => {
            tempValue.current = e.target.value;
          }}
        />
        <Button onClick={() => setFlag(id, "AnyTestFlag", tempValue.current)}>
          Set
        </Button>{" "}
      </div>
    </div>
  );
};

const FlagTesterB = ({ id }: { id: string }) => {
  const v2 = useTrackableFlag(id, "AnyMonthViewType");
  const setFlag = useSetTrackableFlag();
  const tempValue = useRef("");

  return (
    <div className="flex flex-col gap-2 p-4">
      <div>{id}</div>
      <div className="flex gap-2">{v2}</div>
    </div>
  );
};

const DebugComponent = () => {
  const [visualViewportHeight, setVisualViewportHeight] = useState(-1);
  const [innerHeight, setInnerHeight] = useState(-1);

  useEffect(() => {
    setVisualViewportHeight(window.visualViewport?.height ?? -1);
    setInnerHeight(window.innerHeight);

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", () => {
        setVisualViewportHeight(window.visualViewport?.height ?? -1);
        setInnerHeight(window.innerHeight);
      });
    }
  }, []);

  return (
    <div className="flex flex-col gap-2 p-3">
      {visualViewportHeight} {innerHeight}
    </div>
  );
};
