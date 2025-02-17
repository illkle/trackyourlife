import crypto from "crypto";
import a from "@node-rs/argon2";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/start";
import { getWebRequest } from "@tanstack/start/server";
import { z } from "zod";

import { and, db, eq } from "@tyl/db";
import { ingestApiKeys } from "@tyl/db/schema";

import { Button } from "~/@shad/components/button";
import { Spinner } from "~/@shad/components/spinner";
import { auth } from "~/auth/server";
import { useTrackableMeta } from "~/components/Trackable/TrackableProviders/TrackableProvider";

const keyExists = createServerFn({ method: "GET" })
  .validator((v: unknown) => z.object({ trackableId: z.string() }).parse(v))
  .handler(async ({ data }) => {
    const r = getWebRequest();
    if (!r) throw new Error("No request");
    const sessionInfo = await auth.api.getSession({
      headers: r.headers,
    });

    if (!sessionInfo) throw new Error("No session info");

    const key = await db.query.ingestApiKeys.findFirst({
      where: and(
        eq(ingestApiKeys.userId, sessionInfo.user.id),
        eq(ingestApiKeys.trackableId, data.trackableId),
      ),
    });

    return key ? true : false;
  });

const issueKey = createServerFn({ method: "POST" })
  .validator((v: unknown) => z.object({ trackableId: z.string() }).parse(v))
  .handler(async ({ data }) => {
    const r = getWebRequest();
    if (!r) throw new Error("No request");

    const sessionInfo = await auth.api.getSession({
      headers: r.headers,
    });

    if (!sessionInfo) throw new Error("No session info");

    await db
      .delete(ingestApiKeys)
      .where(
        and(
          eq(ingestApiKeys.userId, sessionInfo.user.id),
          eq(ingestApiKeys.trackableId, data.trackableId),
        ),
      );

    const k = crypto.randomBytes(32).toString("hex");

    await db.insert(ingestApiKeys).values({
      userId: sessionInfo.user.id,
      trackableId: data.trackableId,
      key: await a.hash(k),
      createdAt: new Date(),
      daysLimit: 0,
    });

    return k;
  });

export const IngestKeysManager = () => {
  const { id } = useTrackableMeta();
  const { data, isPending } = useQuery({
    queryKey: ["ingest-keys", id],
    queryFn: async () => await keyExists({ data: { trackableId: id } }),
  });

  const { mutate, data: newKey } = useMutation({
    mutationFn: async () => await issueKey({ data: { trackableId: id } }),
  });

  if (isPending)
    return (
      <div>
        <Spinner />
      </div>
    );

  return (
    <div>
      <div>
        {data
          ? "You have an API key for this trackable."
          : "You don't have an API key for this trackable."}
      </div>

      {newKey && (
        <div className="mt-2 rounded-md border p-2 text-xs dark:border-neutral-700 dark:bg-neutral-800">
          {newKey}
        </div>
      )}

      <Button className="mt-2" variant="outline" onClick={() => mutate()}>
        {data ? "Reissue key" : "Issue key"}
      </Button>
    </div>
  );
};
