import type { ReactNode } from "react";
import { createContext, useContext } from "react";

import type { DbTrackableSelect } from "@tyl/db/schema";

import { MemoDayCellProvider } from "~/components/Providers/DayCellProvider";

interface ITrackableContext {
  id: DbTrackableSelect["id"];
  type: DbTrackableSelect["type"];
  settings: DbTrackableSelect["settings"];
}

export const TrackableContext = createContext<ITrackableContext | null>(null);

const TrackableProvider = ({
  trackable,
  children,
}: {
  trackable: DbTrackableSelect;
  children: ReactNode;
}) => {
  return (
    <TrackableContext.Provider
      value={{
        id: trackable.id,
        type: trackable.type,
        settings: trackable.settings,
      }}
    >
      <MemoDayCellProvider type={trackable.type} settings={trackable.settings}>
        {children}
      </MemoDayCellProvider>
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
