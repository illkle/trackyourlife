import { createFileRoute } from "@tanstack/react-router";

import {
  applyCrudTrackable,
  applyCrudTrackableFlags,
  applyCrudTrackableGroup,
  applyCrudTrackableRecord,
  applyCrudUserFlags,
  SyncEntry,
} from "@tyl/db/server/powersync-apply";

import { auth } from "~/auth/server";

export const Route = createFileRoute("/api/powersync/syncbatch")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const u = await auth.api.getSession({ headers: request.headers });
        if (!u) {
          throw new Error("Unauthorized");
        }

        const data = (await request.json()) as SyncEntry[];

        for (const op of data) {
          console.log("UPDATE TO", op.table, op);
          switch (op.table) {
            case "TYL_trackable":
              await applyCrudTrackable(op, u.user.id);
              break;
            case "TYL_trackableFlags":
              await applyCrudTrackableFlags(op, u.user.id);
              break;
            case "TYL_trackableRecord":
              await applyCrudTrackableRecord(op, u.user.id);
              break;
            case "TYL_trackableGroup":
              await applyCrudTrackableGroup(op, u.user.id);
              break;
            case "TYL_userFlags":
              await applyCrudUserFlags(op, u.user.id);
              break;
            default:
              throw new Error(`Unsupported table: ${op.table}`);
          }
        }

        console.log("responding ");

        return Response.json({ message: "Success" });
      },
    },
  },
});
