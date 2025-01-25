import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Card } from "~/@shad/components/card";
import { Input } from "~/@shad/components/input";

export const Route = createFileRoute("/app/testing")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div className="class flex h-[1000px] flex-col">test</div>;
}
