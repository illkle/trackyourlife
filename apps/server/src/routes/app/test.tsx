import { useMemo } from "react";
import { PowerSyncContext, useQuery } from "@powersync/react";
import {
  PowerSyncDatabase,
  WASQLiteOpenFactory,
  WASQLiteVFS,
} from "@powersync/web";
import { createFileRoute } from "@tanstack/react-router";

import { PowersyncSchema } from "@tyl/db/schema-powersync";

import { Connector } from "~/db/connector";

export const Route = createFileRoute("/app/test")({
  component: RouteComponent,
});

function RouteComponent() {
  const powerSync = useMemo(() => {
    const db = new PowerSyncDatabase({
      // The schema you defined in the previous step
      schema: PowersyncSchema,
      database: new WASQLiteOpenFactory({
        dbFilename: "powersync.db",
        vfs: WASQLiteVFS.OPFSCoopSyncVFS,
        flags: {
          enableMultiTabs: typeof SharedWorker !== "undefined",
        },
      }),
      flags: {
        enableMultiTabs: typeof SharedWorker !== "undefined",
      },
    });
    const connector = new Connector();
    db.connect(connector);
    return db;
  }, []);

  return (
    <PowerSyncContext.Provider value={powerSync}>
      <Sub />
    </PowerSyncContext.Provider>
  );
}

function Sub() {
  const results = useQuery("SELECT * FROM TYL_trackable");

  return <div>{JSON.stringify(results)}</div>;
}
