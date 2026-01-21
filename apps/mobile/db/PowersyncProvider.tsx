import { connectPowerSync, db, powersyncDB } from "@/db/powersync";
import { useAuthClient } from "@/lib/authClient";
import { useServerURL } from "@/lib/ServerURLContext";
import { PowerSyncContext } from "@powersync/react-native";
import { PowersyncDrizzleContext } from "@tyl/db/client/context";
import {} from "@tyl/db/client/schema-powersync";
import { ReactNode, useEffect } from "react";

export const PowerSyncProvider = ({ children }: { children: ReactNode }) => {
  const { authClient } = useAuthClient();
  const { powersyncURL, serverURL } = useServerURL();

  const session = authClient.useSession();

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
      <PowersyncDrizzleContext.Provider value={{ db, userID: session.data.user.id }}>
        {children}
      </PowersyncDrizzleContext.Provider>
    </PowerSyncContext.Provider>
  );
};
