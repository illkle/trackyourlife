import { Text, View } from "react-native";
import { Button } from "@/components/ui/button";
import { useSessionCached } from "@/lib/authClient";
import { powersyncDB } from "@/db/powersync";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { DefaultWrapper } from "@/lib/styledComponents";
import * as Updates from "expo-updates";

const PowersyncStatus = () => {
  const [connected, setConnected] = useState(powersyncDB.connected);

  useEffect(() => {
    return powersyncDB.registerListener({
      statusChanged: (status) => {
        setConnected(status.connected);
      },
    });
  }, []);

  return (
    <View className="mt-2 flex flex-row items-center gap-2 px-1 py-1 text-xs">
      <View
        className={twMerge(
          "h-2 w-2 rounded-full",
          connected ? "border border-green-400 bg-green-600" : "border border-red-400 bg-red-600",
        )}
      ></View>
      <Text className="text-muted-foreground">
        {connected ? "Connected to Sync service" : "No connection to Sync service"}
      </Text>
    </View>
  );
};

export const UpdatesStatus = () => {
  const { currentlyRunning, isUpdateAvailable, isUpdatePending } = Updates.useUpdates();
  return (
    <View className="mt-4">
      <Text className="text-muted-foreground">
        Current minor version:{" "}
        {[currentlyRunning.channel, currentlyRunning.runtimeVersion, currentlyRunning.manifest?.id]
          .filter(Boolean)
          .join("/")}
      </Text>
      {isUpdateAvailable && <Text className="mt-2"> Update available </Text>}
      {isUpdatePending && <Text className="mt-2">Update will be applied on next restart</Text>}
      <Button
        variant={"outline"}
        className="mt-2"
        onPress={() => {
          void Updates.checkForUpdateAsync();
        }}
        text="Check for updates"
      />
    </View>
  );
};

export default function TabTwoScreen() {
  const session = useSessionCached();
  return (
    <DefaultWrapper>
      <View>
        <Text className="text-2xl font-bold text-primary">User:</Text>
        <Text className="mt-2 font-mono text-primary">{session.data?.user?.name}</Text>
        <Text className="mt-1 font-mono text-primary">{session.data?.user?.email}</Text>

        <Text className="mt-1 font-mono text-primary">{session.data?.session.id}</Text>
        <Text className="mt-1 font-mono text-primary">
          {session.data?.session?.expiresAt.toISOString()}
        </Text>

        <PowersyncStatus />
        <UpdatesStatus />
        <Button
          variant={"destructive"}
          className="mt-4"
          text="Sign out"
          onPress={() => {
            void session.signOut();
          }}
        />
      </View>
    </DefaultWrapper>
  );
}
