import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { stringToColorHSL } from "@tyl/helpers/colorTools";

import { Input } from "~/@shad/components/input";
import { ScrollArea, ScrollBar } from "~/@shad/components/scroll-area";

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
    <div className="class flex w-32 flex-col">
      <ScrollArea className="h-[40px]">
        <div className="h-[80px] w-full bg-red-500"></div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}
