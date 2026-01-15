import type { ReactNode } from "react";
import { createContext, useContext } from "react";

import { DbTrackableSelect } from "@tyl/db/client/schema-powersync";

type ITrackableContext = Pick<DbTrackableSelect, "id" | "type" | "name">;

export const TrackableContext = createContext<ITrackableContext | null>(null);

const TrackableProvider = ({
  trackable,
  children,
}: {
  trackable: Pick<DbTrackableSelect, "id" | "type" | "name">;
  children: ReactNode;
}) => {
  // Todo: memo
  return (
    <TrackableContext.Provider
      key={trackable.id}
      value={{
        id: trackable.id,
        type: trackable.type,
        name: trackable.name,
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

export default TrackableProvider;
