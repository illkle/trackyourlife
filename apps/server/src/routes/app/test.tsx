import { createContext, useContext, useMemo, useState } from "react";
import {
  toCompilableQuery,
  wrapPowerSyncWithDrizzle,
} from "@powersync/drizzle-driver";
import { PowerSyncContext, useQuery } from "@powersync/react";
import {
  PowerSyncDatabase,
  WASQLiteOpenFactory,
  WASQLiteVFS,
} from "@powersync/web";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import {
  PowersyncDrizzleSchema,
  PowersyncSchema,
  trackable,
  trackableFlags,
  trackableGroup,
  trackableRecord,
} from "@tyl/db/schema-powersync";

import { Button } from "~/@shad/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/@shad/components/card";
import { Input } from "~/@shad/components/input";
import { Label } from "~/@shad/components/label";
import { Separator } from "~/@shad/components/separator";
import { Textarea } from "~/@shad/components/textarea";
import { Connector } from "~/db/connector";

export const Route = createFileRoute("/app/test")({
  component: RouteComponent,
});

const makePowersyncWeb = () => {
  const powersyncDb = new PowerSyncDatabase({
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
  powersyncDb.connect(connector);

  const drizzlePowersyncDb = wrapPowerSyncWithDrizzle(powersyncDb, {
    schema: PowersyncDrizzleSchema,
  });
  return { powersyncDb, drizzlePowersyncDb };
};

const PowersyncDrizzleContext = createContext<
  ReturnType<typeof makePowersyncWeb>["drizzlePowersyncDb"] | null
>(null);

const useDrizzlePowersyncDb = () => {
  const drizzlePowersyncDb = useContext(PowersyncDrizzleContext);
  if (!drizzlePowersyncDb) {
    throw new Error("Drizzle Powersync DB not found");
  }
  return drizzlePowersyncDb;
};

function RouteComponent() {
  const m = useMemo(() => {
    return makePowersyncWeb();
  }, []);

  return (
    <PowerSyncContext.Provider value={m.powersyncDb}>
      <PowersyncDrizzleContext.Provider value={m.drizzlePowersyncDb}>
        <Sub />
      </PowersyncDrizzleContext.Provider>
    </PowerSyncContext.Provider>
  );
}

function Sub() {
  const [selectedTrackableId, setSelectedTrackableId] = useState<string | null>(
    null,
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <TrackablesList onSelectTrackable={setSelectedTrackableId} />
      {selectedTrackableId && (
        <TrackableDetail trackableId={selectedTrackableId} />
      )}
    </div>
  );
}

const TrackablesList = ({
  onSelectTrackable,
}: {
  onSelectTrackable: (id: string) => void;
}) => {
  const dbd = useDrizzlePowersyncDb();
  const results = useQuery(toCompilableQuery(dbd.query.trackable.findMany()));

  const deleteById = async (id: string) => {
    await dbd.delete(trackable).where(eq(trackable.id, id));
  };

  const updateById = async (id: string, currentName: string) => {
    await dbd
      .update(trackable)
      .set({ name: currentName + "*" })
      .where(eq(trackable.id, id));
  };

  const createTrackable = async () => {
    await dbd.insert(trackable).values({
      id: uuidv4(),
      user_id: "",
      name: "yoo",
      type: "boolean",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trackables</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {results.data?.map((trackableItem) => (
          <div
            key={trackableItem.id}
            className="flex w-full items-center gap-2 rounded border p-2"
          >
            <div
              className="flex-1 cursor-pointer"
              onClick={() => onSelectTrackable(trackableItem.id)}
            >
              <div className="font-semibold">{trackableItem.name}</div>
              <div className="text-muted-foreground text-sm">
                Type: {trackableItem.type}
              </div>
            </div>
            <Button
              onClick={() => updateById(trackableItem.id, trackableItem.name)}
            >
              Update
            </Button>
            <Button onClick={() => deleteById(trackableItem.id)}>Delete</Button>
          </div>
        ))}
        <Button onClick={() => createTrackable()}>Create Trackable</Button>
      </CardContent>
    </Card>
  );
};

const TrackableDetail = ({ trackableId }: { trackableId: string }) => {
  const dbd = useDrizzlePowersyncDb();

  return (
    <div className="flex grid-cols-3 flex-col gap-4 md:grid">
      <Card>
        <CardHeader>
          <CardTitle>Trackable Flags</CardTitle>
        </CardHeader>
        <CardContent>
          <TrackableFlagsSection trackableId={trackableId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trackable Records</CardTitle>
        </CardHeader>
        <CardContent>
          <TrackableRecordsSection trackableId={trackableId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trackable Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <TrackableGroupsSection trackableId={trackableId} />
        </CardContent>
      </Card>
    </div>
  );
};

const TrackableFlagsSection = ({ trackableId }: { trackableId: string }) => {
  const dbd = useDrizzlePowersyncDb();
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");

  const flags = useQuery(
    toCompilableQuery(
      dbd.query.trackableFlags.findMany({
        where: eq(trackableFlags.trackable_id, trackableId),
      }),
    ),
  );

  const createFlag = async () => {
    if (!key || !value) return;
    await dbd.insert(trackableFlags).values({
      id: uuidv4(),
      user_id: "",
      trackable_id: trackableId,
      key,
      value,
    });
    setKey("");
    setValue("");
  };

  const updateFlag = async (flagKey: string, currentValue: string) => {
    await dbd
      .update(trackableFlags)
      .set({ value: currentValue + "*" })
      .where(
        and(
          eq(trackableFlags.trackable_id, trackableId),
          eq(trackableFlags.key, flagKey),
        ),
      );
  };

  const deleteFlag = async (flagKey: string) => {
    await dbd
      .delete(trackableFlags)
      .where(
        and(
          eq(trackableFlags.trackable_id, trackableId),
          eq(trackableFlags.key, flagKey),
        ),
      );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="flag-key">Key</Label>
        <Input
          id="flag-key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Flag key"
        />
        <Label htmlFor="flag-value">Value</Label>
        <Input
          id="flag-value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Flag value"
        />
        <Button onClick={createFlag}>Create Flag</Button>
      </div>

      <div className="flex flex-col gap-2">
        {flags.data?.map((flag) => (
          <div
            key={flag.id}
            className="flex items-center gap-2 rounded border p-2"
          >
            <div className="flex-1">
              <div className="font-semibold">{flag.key}</div>
              <div className="text-muted-foreground text-sm">{flag.value}</div>
            </div>
            <Button onClick={() => updateFlag(flag.key, flag.value)}>
              Update
            </Button>
            <Button onClick={() => deleteFlag(flag.key)}>Delete</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

const TrackableRecordsSection = ({ trackableId }: { trackableId: string }) => {
  const dbd = useDrizzlePowersyncDb();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [value, setValue] = useState("");
  const [attributes, setAttributes] = useState("{}");
  const [externalKey, setExternalKey] = useState("");

  const records = useQuery(
    toCompilableQuery(
      dbd.query.trackableRecord.findMany({
        where: eq(trackableRecord.trackable_id, trackableId),
      }),
    ),
  );

  const createRecord = async () => {
    if (!date || !value) return;
    const now = Date.now();
    await dbd.insert(trackableRecord).values({
      id: uuidv4(),
      user_id: "",
      trackable_id: trackableId,
      date: new Date(date).toISOString(),
      value,
      attributes: attributes || "{}",
      created_at: now,
      updated_at: now,
      external_key: externalKey || "",
    });
    setDate(new Date().toISOString().split("T")[0]);
    setValue("");
    setAttributes("{}");
    setExternalKey("");
  };

  const updateRecord = async (id: string, currentValue: string) => {
    await dbd
      .update(trackableRecord)
      .set({
        value: currentValue + "*",
        updated_at: Date.now(),
      })
      .where(eq(trackableRecord.id, id));
  };

  const deleteRecord = async (id: string) => {
    await dbd.delete(trackableRecord).where(eq(trackableRecord.id, id));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="record-date">Date</Label>
        <Input
          id="record-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Label htmlFor="record-value">Value</Label>
        <Input
          id="record-value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Record value"
        />
        <Label htmlFor="record-attributes">Attributes (JSON)</Label>
        <Textarea
          id="record-attributes"
          value={attributes}
          onChange={(e) => setAttributes(e.target.value)}
          placeholder='{"key": "value"}'
        />
        <Label htmlFor="record-external-key">External Key</Label>
        <Input
          id="record-external-key"
          value={externalKey}
          onChange={(e) => setExternalKey(e.target.value)}
          placeholder="External key"
        />
        <Button onClick={createRecord}>Create Record</Button>
      </div>

      <div className="flex flex-col gap-2">
        {records.data?.map((record) => (
          <div
            key={record.id}
            className="flex flex-col gap-2 rounded border p-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-semibold">
                  {format(new Date(record.date), "yyyy-MM-dd")}
                </div>
                <div className="text-muted-foreground text-sm">
                  Value: {record.value}
                </div>
                <div className="text-muted-foreground text-sm">
                  External Key: {record.external_key || "N/A"}
                </div>
                <div className="text-muted-foreground mt-1 text-xs">
                  Attributes: {record.attributes}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => updateRecord(record.id, record.value)}>
                  Update
                </Button>
                <Button onClick={() => deleteRecord(record.id)}>Delete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TrackableGroupsSection = ({ trackableId }: { trackableId: string }) => {
  const dbd = useDrizzlePowersyncDb();
  const [group, setGroup] = useState("");

  const groups = useQuery(
    toCompilableQuery(
      dbd.query.trackableGroup.findMany({
        where: eq(trackableGroup.trackable_id, trackableId),
      }),
    ),
  );

  const createGroup = async () => {
    if (!group) return;
    await dbd.insert(trackableGroup).values({
      id: uuidv4(),
      user_id: "",
      trackable_id: trackableId,
      group,
    });
    setGroup("");
  };

  const deleteGroup = async (groupName: string) => {
    await dbd
      .delete(trackableGroup)
      .where(
        and(
          eq(trackableGroup.trackable_id, trackableId),
          eq(trackableGroup.group, groupName),
        ),
      );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="group-name">Group Name</Label>
        <Input
          id="group-name"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          placeholder="Group name"
        />
        <Button onClick={createGroup}>Create Group</Button>
      </div>
      {groups.data.length} groups
      <div className="flex flex-col gap-2">
        {groups.data?.map((groupItem) => (
          <div
            key={groupItem.id}
            className="flex items-center gap-2 rounded border p-2"
          >
            <div className="flex-1 font-semibold">{groupItem.group}</div>
            <Button onClick={() => deleteGroup(groupItem.group)}>Delete</Button>
          </div>
        ))}
      </div>
    </div>
  );
};
