import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { stringToColorHSL } from "@tyl/helpers/colorTools";

import { Input } from "~/@shad/components/input";

export const Route = createFileRoute("/app/testing")({
  component: RouteComponent,
});

const DemoComp = () => {
  const [state, setState] = useState("");

  const color = stringToColorHSL(state);

  return (
    <div className="class flex flex-col">
      <Input
        value={state}
        onChange={(e) => setState(e.target.value)}
        placeholder="Enter a string"
      />

      <div
        style={{ backgroundColor: `hsl(${color.h}, ${color.s}%, ${color.l}%)` }}
        className="p-4"
      >
        {state}
      </div>
    </div>
  );
};

function RouteComponent() {
  return (
    <div className="class flex h-[1000px] flex-col">
      <DemoComp />
      <DemoComp />
      <DemoComp />
      <DemoComp />
      <DemoComp />
    </div>
  );
}
