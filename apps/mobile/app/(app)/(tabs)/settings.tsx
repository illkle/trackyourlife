import { Text, View } from "react-native";
import { Button } from "@/components/ui/button";
import { useSessionCached } from "@/lib/authClient";
import { powersyncDB } from "@/db/powersync";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { DefaultWrapper } from "@/lib/styledComponents";
import * as Updates from "expo-updates";
import { useMutation } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import type { IColorCodingValue } from "@tyl/db/jsonValidators";
import { presetsMap } from "@tyl/helpers/colorTools";
import { ColorInput } from "@/components/inputs/colors/colorInput";
import { ColorPicker } from "@/components/inputs/colors/colorPicker";
import { NumberColorSelector } from "@/components/inputs/colors/numberColorSelector";

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
  const u = Updates.useUpdates();
  const {
    availableUpdate,
    checkError,
    currentlyRunning,
    downloadedUpdate,
    downloadError,
    downloadProgress,
    isChecking,
    isDownloading,
    isRestarting,
    isStartupProcedureRunning,
    isUpdateAvailable,
    isUpdatePending,
    lastCheckForUpdateTimeSinceRestart,
    restartCount,
  } = u;

  const checkUpdatesM = useMutation({
    mutationFn: Updates.checkForUpdateAsync,
  });

  const formatRelativeTime = (value?: Date) => {
    if (!value) return "never";

    return `${formatDistanceToNowStrict(value)} ago`;
  };

  const updateLabel = (update?: Updates.UpdateInfo) => {
    if (!update) return "none";

    return [update.type, update.updateId, formatRelativeTime(update.createdAt)]
      .filter(Boolean)
      .join(" / ");
  };

  return (
    <View className="mt-4">
      <Text className="text-muted-foreground">
        Current minor version:{" "}
        {[currentlyRunning.channel, currentlyRunning.runtimeVersion, currentlyRunning.manifest?.id]
          .filter(Boolean)
          .join("/")}
      </Text>
      <Text className="mt-1 text-muted-foreground">
        Runtime state:{" "}
        {[
          currentlyRunning.isEmbeddedLaunch ? "embedded" : "downloaded",
          currentlyRunning.isEmergencyLaunch ? "emergency launch" : undefined,
          currentlyRunning.emergencyLaunchReason ?? undefined,
        ]
          .filter(Boolean)
          .join(" / ")}
      </Text>
      <Text className="mt-1 text-muted-foreground">Last check: {formatRelativeTime(lastCheckForUpdateTimeSinceRestart)}</Text>
      <Text className="mt-1 text-muted-foreground">Restart count since cold start: {restartCount}</Text>
      <Text className="mt-1 text-muted-foreground">
        Procedure state:{" "}
        {[
          isStartupProcedureRunning ? "startup running" : undefined,
          isChecking ? "checking" : undefined,
          isDownloading ? "downloading" : undefined,
          isRestarting ? "restarting" : undefined,
        ]
          .filter(Boolean)
          .join(" / ") || "idle"}
      </Text>
      {typeof downloadProgress === "number" && (
        <Text className="mt-1 text-muted-foreground">
          Download progress: {Math.round(downloadProgress * 100)}%
        </Text>
      )}
      {isUpdateAvailable && <Text className="mt-2"> Update available </Text>}
      {isUpdatePending && <Text className="mt-2">Update will be applied on next restart</Text>}
      <Text className="mt-1 text-muted-foreground">Available update: {updateLabel(availableUpdate)}</Text>
      <Text className="mt-1 text-muted-foreground">Downloaded update: {updateLabel(downloadedUpdate)}</Text>
      {checkError?.message && (
        <Text className="mt-2 text-destructive">Check error: {checkError.message}</Text>
      )}
      {downloadError?.message && (
        <Text className="mt-2 text-destructive">Download error: {downloadError.message}</Text>
      )}
      <Button
        variant={"outline"}
        className="mt-2"
        loading={checkUpdatesM.isPending}
        onPress={() => {
          checkUpdatesM.mutate();
        }}
        text="Check for updates"
      />
    </View>
  );
};

export default function TabTwoScreen() {
  const session = useSessionCached();
  const [demoColor, setDemoColor] = useState(presetsMap.blue);
  const [colorInputValue, setColorInputValue] = useState(presetsMap.green);
  const [numberColors, setNumberColors] = useState<IColorCodingValue[]>([
    {
      id: "start",
      point: 0,
      color: presetsMap.neutral,
    },
    {
      id: "mid",
      point: 50,
      color: presetsMap.orange,
    },
    {
      id: "end",
      point: 100,
      color: presetsMap.green,
    },
  ]);

  return (
    <DefaultWrapper>
      <View className="pb-6">
        <Text className="text-2xl font-bold text-primary">User:</Text>
        <Text className="mt-2 font-mono text-primary">{session.data?.user?.name}</Text>
        <Text className="mt-1 font-mono text-primary">{session.data?.user?.email}</Text>

        <Text className="mt-1 font-mono text-primary">{session.data?.session.id}</Text>
        <Text className="mt-1 font-mono text-primary">
          {session.data?.session?.expiresAt.toISOString()}
        </Text>

        <PowersyncStatus />
        <UpdatesStatus />

        <View className="mt-6 gap-3 rounded-lg border border-border p-3">
          <Text className="text-lg font-semibold text-foreground">Color controls showcase</Text>
          <Text className="text-sm text-muted-foreground">
            Demo-only controls (local state, no DB writes)
          </Text>

          <View className="mt-2 gap-2">
            <Text className="text-sm font-medium text-foreground">ColorInput</Text>
            <ColorInput value={colorInputValue} onChange={(v) => setColorInputValue(v)} />
          </View>

          <View className="mt-2 gap-2">
            <Text className="text-sm font-medium text-foreground">ColorPicker</Text>
            <ColorPicker value={demoColor} onChange={setDemoColor} />
          </View>

          <View className="mt-2 gap-2">
            <Text className="text-sm font-medium text-foreground">NumberColorSelector</Text>
            <NumberColorSelector value={numberColors} onChange={(v) => setNumberColors(v)} />
          </View>
        </View>

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
