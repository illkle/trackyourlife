import type { ReactNode } from "react";
import { createContext, useContext, memo } from "react";

import { DbTrackableSelect } from "@tyl/db/client/schema-powersync";

export type ITrackableContext = Pick<DbTrackableSelect, "id" | "type" | "name"> & {
  bucketing: NonNullable<DbTrackableSelect["bucketing"]>;
};

export const TrackableContext = createContext<ITrackableContext | null>(null);

export const TrackableMetaProvider = memo(
  ({ trackable, children }: { trackable: DbTrackableSelect; children: ReactNode }) => {
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
  },
  (prevProps, nextProps) => {
    return (
      prevProps.trackable.id === nextProps.trackable.id &&
      prevProps.trackable.type === nextProps.trackable.type &&
      prevProps.trackable.name === nextProps.trackable.name &&
      prevProps.trackable.bucketing === nextProps.trackable.bucketing
    );
  },
);

export const useTrackableMeta = () => {
  const context = useContext(TrackableContext);
  if (!context) {
    throw new Error("useTrackableId must be used within a TrackableProvider");
  }
  return context;
};
