import { useEffect, useRef } from "react";
import { db, powersyncDB } from "@/db/powersync";
import { TYL_trackable, TYL_trackableRecord } from "@/db/schema";
import { GetAllQuery, useWatchedQuerySubscription } from "@powersync/react-native";
import { eq } from "drizzle-orm";

const trackablesListSQL = db.select().from(TYL_trackable).orderBy(TYL_trackable.name).toSQL().sql;

type Trackable = typeof TYL_trackable.$inferSelect;

export const queryTrackablesList = powersyncDB
  .query<Trackable>({
    sql: trackablesListSQL,
    parameters: ["pending"],
  })
  .watch();

export const useTrackablesList = () => {
  return useWatchedQuerySubscription(queryTrackablesList);
};

const useTrackableSql = db.select().from(TYL_trackable).where(eq(TYL_trackable.id, "")).toSQL().sql;

export const useTrackable = (id: string) => {
  const q = useRef(
    powersyncDB.query<Trackable>({ sql: useTrackableSql, parameters: [id] }).watch(),
  );

  useEffect(() => {
    q.current.updateSettings({
      query: new GetAllQuery({
        sql: useTrackableSql,
        parameters: [id],
      }),
    });
  }, [id]);

  const r = useWatchedQuerySubscription(q.current);

  return { ...r, data: r.data?.[0], rawData: r.data };
};

const useTrackableRecordsSql = db
  .select()
  .from(TYL_trackableRecord)
  .where(eq(TYL_trackableRecord.trackableId, ""))
  .toSQL().sql;

type TrackableRecords = typeof TYL_trackableRecord.$inferSelect;

export const useTrackableRecords = (id: string) => {
  const q = useRef(
    powersyncDB
      .query<TrackableRecords>({
        sql: useTrackableRecordsSql,
        parameters: [id],
      })
      .watch(),
  );

  useEffect(() => {
    q.current.updateSettings({
      query: new GetAllQuery({
        sql: useTrackableRecordsSql,
        parameters: [id],
      }),
    });
  }, [id]);

  return useWatchedQuerySubscription(q.current);
};
