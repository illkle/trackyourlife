import { CrudBatch } from "@powersync/common";
import { createFileRoute } from "@tanstack/react-router";

import {
  applyCrudTrackable,
  applyCrudTrackableFlags,
  applyCrudTrackableGroup,
  applyCrudTrackableRecord,
  applyCrudUserFlags,
} from "@tyl/db/powersync-apply";

import { auth } from "~/auth/server";

export const Route = createFileRoute("/api/powersync/syncbatch")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const u = await auth.api.getSession({ headers: request.headers });
        if (!u) {
          throw new Error("Unauthorized");
        }

        const data = (await request.json()) as CrudBatch["crud"];

        for (const op of data) {
          switch (op.table) {
            case "trackable":
              await applyCrudTrackable(op, u.user.id);
              break;
            case "trackableFlags":
              await applyCrudTrackableFlags(op, u.user.id);
              break;
            case "trackableRecord":
              await applyCrudTrackableRecord(op, u.user.id);
              break;
            case "trackableGroup":
              await applyCrudTrackableGroup(op, u.user.id);
              break;
            case "userFlags":
              await applyCrudUserFlags(op, u.user.id);
              break;
            default:
              throw new Error(`Unsupported table: ${op.table}`);
          }
        }

        return Response.json({ message: "Success" });
      },
    },
  },
});
