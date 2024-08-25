import { createContext, ReactNode, useContext, useMemo } from "react";
import { and, between, eq, sql } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import {
  ITrackable,
  ITrackableFromList,
  ZTrackableSettings,
} from "@tyl/validators/trackable";

import { MemoDayCellProvider } from "~/app/_components/DayCellProvider";
import { db } from "~/db";
import { trackableRecord } from "~/db/schema";
import { useSync } from "~/db/syncContext";

type UseReturn = {
  value?: string;
  error?: Error;
};

interface ITrackableContext {
  type: ITrackable["type"];
  name: ITrackable["name"];
  settings: ITrackable["settings"];
  useValue: (d: Date) => UseReturn;
  setValue: (d: Date, v: string) => void;
}

export const makeTrackableSettings = (trackable: unknown) => {
  const parseRes = ZTrackableSettings.safeParse(trackable);
  if (parseRes.success) {
    return parseRes.data;
  }
  return {};
};

const TrackableContext = createContext<ITrackableContext | null>(null);

export type ITrackableFromAppDB = ITrackableFromList & {
  settings: unknown;
  userId: string;
};

export const TrackableProvider = ({
  trackable,
  children,
}: {
  trackable: ITrackableFromAppDB;
  children: ReactNode;
}) => {
  const { updateTrackableRecord } = useSync();

  const parsedSettings = useMemo(
    () => makeTrackableSettings(trackable),
    [trackable.settings],
  );

  const useValue = (d: Date) => {
    const from = new Date(d.getTime());
    const to = new Date(d.getTime());
    from.setUTCHours(0, 0, 0, 0);
    to.setUTCHours(23, 59, 59, 999);

    const { data, error } = useLiveQuery(
      db.query.trackableRecord.findFirst({
        where: and(
          between(trackableRecord.date, from, to),
          eq(trackableRecord.trackableId, trackable.id),
        ),
      }),
    );

    return { value: data?.value, error };
  };

  const setValue = async (d: Date, v: string) => {
    d.setUTCHours(0, 0, 0, 0);

    await updateTrackableRecord({
      userId: trackable.userId,
      trackableId: trackable.id,
      value: v,
      date: d,
    });
  };

  return (
    <TrackableContext.Provider
      value={{
        type: trackable.type,
        name: trackable.name,
        settings: parsedSettings,
        useValue,
        setValue,
      }}
    >
      <MemoDayCellProvider type={trackable.type} settings={parsedSettings}>
        {children}
      </MemoDayCellProvider>
    </TrackableContext.Provider>
  );
};

export const useTrackableContextSafe = () => {
  const stuff = useContext(TrackableContext);

  if (!stuff) throw new Error("useTrackableContextSafe: no data in context");

  return stuff;
};
