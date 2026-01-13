import { useMemo } from "react";
import { PowerSyncContext, usePowerSync, useQuery } from "@powersync/react";
import {
  PowerSyncDatabase,
  WASQLiteOpenFactory,
  WASQLiteVFS,
} from "@powersync/web";
import { createFileRoute } from "@tanstack/react-router";
import { v4 as uuidv4 } from "uuid";

import { PowersyncDatabase, PowersyncSchema } from "@tyl/db/schema-powersync";

import { Button } from "~/@shad/components/button";
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
  const results = useQuery<PowersyncDatabase["TYL_trackable"]>(
    "SELECT * FROM TYL_trackable",
  );
  const db = usePowerSync();

  const deleteById = async (id: string) => {
    await db.execute("DELETE FROM TYL_trackable WHERE id = ?", [id]);
  };

  const updateById = async (id: string, currentName: string) => {
    await db.execute("UPDATE TYL_trackable SET name = ? WHERE id = ?", [
      currentName + "*",
      id,
    ]);
  };

  const createTrackable = async () => {
    await db.execute(
      "INSERT INTO TYL_trackable (id, name, user_id, type) VALUES (?, ?, ?, ?)",
      [uuidv4(), "yoo", "1", "boolean"],
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {results.data?.map((trackable) => (
        <div key={trackable.id} className="flex w-64 items-center gap-2 border">
          {trackable.name}
          <Button onClick={() => deleteById(trackable.id)}>Delete</Button>

          <Button onClick={() => updateById(trackable.id, trackable.name)}>
            Update
          </Button>
        </div>
      ))}

      <Button onClick={() => createTrackable()}>Create</Button>
    </div>
  );
}
