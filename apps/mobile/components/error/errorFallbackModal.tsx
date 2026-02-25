import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import * as Updates from "expo-updates";

import { Button } from "@/components/ui/button";
import type { ErrorDebugPayload } from "@tyl/helpers";
import { UpdatesStatus } from "@/app/(app)/(tabs)/settings";

export const ErrorFallbackModal = ({
  payload,
  onRetry,
}: {
  payload: ErrorDebugPayload;
  onRetry: () => void;
}) => {
  const stackLines = useMemo(() => {
    if (!payload.error.stack) return [];
    return payload.error.stack.split("\n").slice(0, 10);
  }, [payload.error.stack]);

  const showDebug = __DEV__;

  return (
    <View className="max-h-[85%] w-full rounded-2xl border border-destructive/30 bg-card p-4">
      <Text className="text-xl font-bold text-destructive">Something went wrong</Text>
      <Text className="mt-2 text-sm text-muted-foreground">App or some part of it crashed</Text>

      <View className="mt-3 rounded-lg bg-background p-3">
        <Text className="text-sm text-foreground">{payload.error.message}</Text>
        <Text className="mt-2 font-mono text-xs text-muted-foreground">Error ID: {payload.id}</Text>
        <Text className="mt-1 font-mono text-xs text-muted-foreground">
          Boundary: {payload.boundaryName}
        </Text>
        <Text className="mt-1 font-mono text-xs text-muted-foreground">
          At: {payload.createdAt}
        </Text>
      </View>
      {showDebug && (
        <ScrollView className="mt-3 max-h-100 rounded-lg border border-border bg-background p-3">
          {stackLines.length > 0 ? (
            stackLines.map((line, index) => (
              <Text key={index} className="font-mono text-xs text-muted-foreground">
                {line}
              </Text>
            ))
          ) : (
            <Text className="font-mono text-xs text-muted-foreground">No stack available.</Text>
          )}
          {!!payload.componentStack && (
            <Text className="mt-2 font-mono text-xs text-muted-foreground">
              {payload.componentStack}
            </Text>
          )}
        </ScrollView>
      )}

      <Button variant="outline" text="Try again" className="mt-2" onPress={onRetry} />
      <UpdatesStatus />
    </View>
  );
};
