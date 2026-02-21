import {
  connectPowerSync,
  db,
  dbT,
  powersyncDB,
  transactor,
} from '@/db/powersync';
import { useAuthClient, useSessionCached } from '@/lib/authClient';
import { useServerURL } from '@/lib/ServerURLContext';
import { PowerSyncContext } from '@powersync/react-native';
import { PowersyncDrizzleContext } from '@tyl/helpers/data/context';
import { ReactNode, useEffect } from 'react';

export const MobilePowerSyncProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { authClient } = useAuthClient();
  const { powersyncURL, serverURL } = useServerURL();

  const session = useSessionCached();

  useEffect(() => {
    if (!powersyncURL || !serverURL || !session.data?.user) return;
    connectPowerSync({ powersyncURL, serverURL, authClient });
  }, [session.data?.user, powersyncURL, serverURL, authClient]);

  if (!session.data?.user) {
    console.error('User not found');
    return null;
  }

  if (!powersyncURL || !serverURL) {
    console.error('Powersync URL or Server URL not found');
    return null;
  }

  return (
    <PowerSyncContext.Provider value={powersyncDB}>
      <PowersyncDrizzleContext.Provider
        value={{
          dbS: powersyncDB,
          db,
          dbT,
          userID: session.data.user.id,
          transactor,
        }}
      >
        {children}
      </PowersyncDrizzleContext.Provider>
    </PowerSyncContext.Provider>
  );
};
