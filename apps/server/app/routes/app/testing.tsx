import { useState } from "react";
import { ScrollArea, ScrollAreaViewport } from "@radix-ui/react-scroll-area";
import { createFileRoute } from "@tanstack/react-router";

import { stringToColorHSL } from "@tyl/helpers/colorTools";

import { Input } from "~/@shad/components/input";
import { ScrollBar } from "~/@shad/components/scroll-area";

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
    <div className="class flex max-h-[200px] w-32 flex-col bg-red-200">
      <div className="h-[100px] w-full bg-green-500"></div>
      <ScrollArea className="flex max-h-[100px] w-full flex-col bg-blue-500">
        <ScrollAreaViewport h-max>
          asljkdhjasjkldjasd asdjkljasdl askldjlaskd lkasjljkdjas askldjas
        </ScrollAreaViewport>

        <ScrollBar />
      </ScrollArea>
    </div>
  );
}
