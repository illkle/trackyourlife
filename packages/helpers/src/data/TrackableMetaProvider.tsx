import type { ReactNode } from "react";
import { createContext, useContext } from "react";

import { DbTrackableSelect } from "@tyl/db/client/schema-powersync";

export type ITrackableContext = Pick<DbTrackableSelect, "id" | "type" | "name" | "bucketing">;

export const TrackableContext = createContext<ITrackableContext | null>(null);

export const TrackableMetaProvider = ({
  trackable,
  children,
}: {
  trackable: DbTrackableSelect;
  children: ReactNode;
}) => {
  return (
    <TrackableContext.Provider
      key={trackable.id}
      value={{
        id: trackable.id,
        type: trackable.type,
        name: trackable.name,
        bucketing: trackable.bucketing ?? "day",
      }}
    >
      {children}
    </TrackableContext.Provider>
  );
};

export const useTrackableMeta = () => {
  const context = useContext(TrackableContext);
  if (!context) {
    throw new Error("useTrackableId must be used within a TrackableProvider");
  }
  return context;
};
