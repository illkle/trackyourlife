import { createFileRoute } from "@tanstack/react-router";
import { usePowersyncDrizzle } from "@tyl/db/client/context";
import { useLiveQuery } from "@tanstack/react-db";

export const Route = createFileRoute("/app/testing")({
  component: RouteComponent,
});

function RouteComponent() {
  const { dbT } = usePowersyncDrizzle();

  const q = useLiveQuery((q) => q.from({ aa: dbT.trackableFlags }));

  const ff = async () => {
    console.log(dbT.trackable);
    console.log("react-db resolved:", import.meta.resolve("@tanstack/react-db"));
    console.log(
      "powersync-db-collection resolved:",
      import.meta.resolve("@tanstack/powersync-db-collection"),
    );
  };

  return (
    <div className="mx-auto max-w-md" onClick={ff}>
      {q.status}

      {JSON.stringify(q.data)}
    </div>
  );
}
