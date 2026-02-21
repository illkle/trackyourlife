import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "@tanstack/react-db";
import { usePowersyncDrizzle } from "@tyl/helpers/data/context";
import { Button } from "~/@shad/components/button";
import { useRef } from "react";

export const Route = createFileRoute("/app/testing")({
  component: RouteComponent,
});

function RouteComponent() {
  const { dbT } = usePowersyncDrizzle(); // just a helper context that return tanstack db

  const q = useLiveQuery((q) => q.from({ aa: dbT.trackable }).findOne());

  const counterRef = useRef(0);

  const setName = () => {
    if (!q.data?.id) return;

    const cc = counterRef.current;
    counterRef.current++;

    dbT.trackable.update(q.data.id, (v) => {
      v.name = String(cc);
    });
  };

  console.log("render with name ", q.data?.name);

  return (
    <div className="mx-auto max-w-md">
      {q.data?.name}
      <Button onClick={() => setName()}> Update name</Button>
    </div>
  );
}
