import {
  db,
  dbT,
  disconnectPowerSync,
  ensurePowerSyncConnected,
  powersyncDB,
  transactor,
} from '@/db/powersync';
import { useAuthClient, useSessionCached } from '@/lib/authClient';
import { useServerURL } from '@/lib/ServerURLContext';
import { PowerSyncContext } from '@powersync/react-native';
import { PowersyncDrizzleContext } from '@tyl/helpers/data/context';
import * as Network from 'expo-network';
import { ReactNode, useEffect, useRef, useState } from 'react';

const DISCONNECT_GRACE_MS = 20_000;

export const MobilePowerSyncProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { authClient } = useAuthClient();
  const { powersyncURL, serverURL } = useServerURL();
  const session = useSessionCached();
  const userID = session.data?.user?.id;
  const sessionToken = session.data?.session?.token;
  const [isOnline, setIsOnline] = useState(true);
  const disconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;

    const syncInitialNetworkState = async () => {
      const state = await Network.getNetworkStateAsync();
      if (!mounted) return;
      setIsOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    };

    void syncInitialNetworkState();

    const subscription = Network.addNetworkStateListener((state) => {
      setIsOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      if (disconnectTimerRef.current) {
        clearTimeout(disconnectTimerRef.current);
        disconnectTimerRef.current = null;
      }
      return;
    }

    if (disconnectTimerRef.current) return;

    disconnectTimerRef.current = setTimeout(() => {
      disconnectTimerRef.current = null;
      void disconnectPowerSync();
    }, DISCONNECT_GRACE_MS);
  }, [isOnline]);

  useEffect(() => {
    if (!isOnline || !powersyncURL || !serverURL || !userID || !sessionToken) return;

    void ensurePowerSyncConnected({
      powersyncURL,
      serverURL,
      authClient,
      userID,
      sessionToken,
    });
  }, [isOnline, powersyncURL, serverURL, authClient, userID, sessionToken]);

  useEffect(() => {
    if (!userID || !sessionToken || !powersyncURL || !serverURL) {
      void disconnectPowerSync();
    }
  }, [userID, sessionToken, powersyncURL, serverURL]);

  useEffect(() => {
    return () => {
      if (disconnectTimerRef.current) {
        clearTimeout(disconnectTimerRef.current);
      }
      void disconnectPowerSync();
    };
  }, []);

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
