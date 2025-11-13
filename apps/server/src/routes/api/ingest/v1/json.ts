import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod/v4";

import { db, eq } from "@tyl/db";
import { ingestApiKeys } from "@tyl/db/schema";

import { auth } from "~/auth/server";
import {
  importData,
  zImportJson,
} from "~/components/Trackable/ImportExport/importLogic";

export const Route = createFileRoute("/api/ingest/v1/json")({
  server: {
    handlers: {
      PUT: async ({ request }: { request: Request }) => {
        let validatedUserId = null;
        let validatedTrackableId = null;

        const apiKey = request.headers.get("x-api-key");
        const auhedUser = request.headers.get("x-authed-user");
        const auhedTrackable = request.headers.get("x-authed-trackable");

        if (apiKey) {
          const keyValue = await db.query.ingestApiKeys.findFirst({
            where: eq(ingestApiKeys.key, apiKey),
            with: {
              user: true,
              trackable: true,
            },
          });

          if (!keyValue) {
            return json({ error: "Invalid API key" }, { status: 401 });
          }

          if (keyValue.user.id !== keyValue.trackable.user_id) {
            return json({ error: "Invalid API key" }, { status: 401 });
          }

          validatedUserId = keyValue.user.id;
          validatedTrackableId = keyValue.trackable.id;
        } else if (auhedUser) {
          const u = await auth.api.getSession({ headers: request.headers });
          if (u?.user.id) {
            validatedUserId = u.user.id;
            validatedTrackableId = auhedTrackable;
          }
        }

        if (!validatedUserId || !validatedTrackableId) {
          return json({ error: "Invalid api key" }, { status: 401 });
        }

        console.log("validatedUserId", validatedUserId);
        console.log("validatedTrackableId", validatedTrackableId);

        const body = (await request.json()) as unknown;

        const validated = z.array(zImportJson).safeParse(body);

        if (!validated.success) {
          return json(
            { error: "Invalid JSON", message: validated.error.message },
            { status: 400 },
          );
        }
        try {
          const res = await importData(
            validatedUserId,
            validated.data,
            validatedTrackableId,
          );

          return json({ ...res, success: true }, { status: 200 });
        } catch (e) {
          console.error(e);
          return json({ error: "Error importing data" }, { status: 500 });
        }
      },
    },
  },
});
