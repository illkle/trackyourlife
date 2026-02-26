import { useEffect, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { z } from "zod";

import {
  closeInputEditorModalDraft,
  updateInputEditorModalDraft,
  useInputEditorModalDraft,
} from "@/lib/inputEditorModalStore";

import { AppErrorBoundary } from "@/components/error/appErrorBoundary";
import { ColorPicker } from "@/components/inputs/colors/colorPicker";

const InputEditorModalParamsSchema = z.object({
  draftId: z.string().min(1),
  kind: z.enum(["color"]),
});

const InputEditorModal = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const parsed = useMemo(
    () =>
      InputEditorModalParamsSchema.safeParse({
        draftId: Array.isArray(params.draftId) ? params.draftId[0] : params.draftId,
        kind: Array.isArray(params.kind) ? params.kind[0] : params.kind,
      }),
    [params.draftId, params.kind],
  );

  const draft = useInputEditorModalDraft(parsed.success ? parsed.data.draftId : "");

  const handleClose = () => {
    if (parsed.success) {
      closeInputEditorModalDraft(parsed.data.draftId);
    }
  };

  useEffect(() => {
    if (!parsed.success) {
      router.back();
    }
  }, [parsed.success, router]);

  useEffect(() => {
    if (!parsed.success) {
      return;
    }

    if (!draft || draft.kind !== parsed.data.kind) {
      router.back();
    }
  }, [draft, parsed, router]);

  useEffect(() => {
    if (!parsed.success) {
      return;
    }

    const draftId = parsed.data.draftId;
    return () => {
      closeInputEditorModalDraft(draftId);
    };
  }, [parsed]);

  if (!parsed.success || !draft || draft.kind !== "color") {
    return null;
  }

  return (
    <View className="flex-1 justify-end">
      <Pressable className="absolute inset-0" onPress={handleClose} />

      <View className="max-h-[85%] rounded-t-3xl border border-border bg-card px-4 pt-6 pb-8">
        <Text className="mb-3 text-lg font-semibold text-foreground">
          {draft.title ?? "Color picker"}
        </Text>
        <ColorPicker
          value={draft.value}
          onChange={(nextValue) => {
            updateInputEditorModalDraft("color", parsed.data.draftId, nextValue);
          }}
        />
      </View>
    </View>
  );
};

export default function InputEditorModalRoute() {
  return (
    <AppErrorBoundary boundaryName="input-editor-modal">
      <InputEditorModal />
    </AppErrorBoundary>
  );
}
