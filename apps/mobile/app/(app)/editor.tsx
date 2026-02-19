import { useEffect, useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { isValid, parseISO } from "date-fns";
import { z } from "zod";

import { EditorModal } from "@/components/editorModal";

const EditorParamsSchema = z.object({
  trackableId: z.string().min(1),
  date: z.string().min(1),
});

export default function EditorRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const parsed = useMemo(
    () =>
      EditorParamsSchema.safeParse({
        trackableId: Array.isArray(params.trackableId) ? params.trackableId[0] : params.trackableId,
        date: Array.isArray(params.date) ? params.date[0] : params.date,
      }),
    [params.date, params.trackableId],
  );

  const timestamp = useMemo(() => {
    if (!parsed.success) return null;
    const parsedDate = parseISO(parsed.data.date);
    return isValid(parsedDate) ? parsedDate : null;
  }, [parsed]);

  useEffect(() => {
    if (!parsed.success || !timestamp) {
      router.back();
    }
  }, [parsed.success, router, timestamp]);

  if (!parsed.success || !timestamp) {
    return null;
  }

  return (
    <EditorModal
      trackableId={parsed.data.trackableId}
      timestamp={timestamp}
      onClose={() => router.back()}
    />
  );
}
