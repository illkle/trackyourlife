
import { connectPowerSync, db, dbT, powersyncDB } from "@/db/powersync";
import { useAuthClient, useSessionCached } from "@/lib/authClient";
import { useServerURL } from "@/lib/ServerURLContext";
import { PowerSyncContext } from "@powersync/react-native";
import { PowersyncDrizzleContext } from "@tyl/db/client/context";
import { ReactNode, useEffect } from "react";

export const PowerSyncProvider = ({ children }: { children: ReactNode }) => {
  const { authClient } = useAuthClient();
  const { powersyncURL, serverURL } = useServerURL();

  const session = useSessionCached();

  if (!session.data?.user) {
    console.error("User not found");
    return null;
  }

  if (!powersyncURL || !serverURL) {
    console.error("Powersync URL or Server URL not found");
    return null;
  }

  useEffect(() => {
    connectPowerSync({ powersyncURL, serverURL, authClient });
  }, [db, powersyncDB, session.data.user.id, powersyncURL]);

  return (
    <PowerSyncContext.Provider value={powersyncDB}>
      <PowersyncDrizzleContext.Provider value={{ db, dbT, userID: session.data.user.id }}>
        {children}
      </PowersyncDrizzleContext.Provider>
    </PowerSyncContext.Provider>
  );
};
