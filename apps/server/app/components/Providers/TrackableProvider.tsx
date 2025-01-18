import type { ReactNode } from "react";
import { createContext, useContext } from "react";

import type { ITrackableZero } from "~/schema";

interface ITrackableContext {
  id: ITrackableZero["id"];
  type: ITrackableZero["type"];
  name: ITrackableZero["name"];
  settings: ITrackableZero["settings"];
}

export const TrackableContext = createContext<ITrackableContext | null>(null);

const TrackableProvider = ({
  trackable,
  children,
}: {
  trackable: Pick<ITrackableZero, "id" | "type" | "settings" | "name">;
  children: ReactNode;
}) => {
  return (
    <TrackableContext.Provider
      value={{
        id: trackable.id,
        type: trackable.type,
        name: trackable.name,
        settings: trackable.settings,
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
