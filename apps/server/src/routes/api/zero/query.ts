import { mustGetQuery } from "@rocicorp/zero";
import { handleQueryRequest } from "@rocicorp/zero/server";
import { createFileRoute } from "@tanstack/react-router";

import { queries } from "@tyl/db/queries";
import { schema } from "@tyl/db/zero-schema";

import { auth } from "~/auth/server";

export const Route = createFileRoute("/api/zero/query")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const u = await auth.api.getSession({ headers: request.headers });

        const result = await handleQueryRequest(
          (name, args) => {
            const query = mustGetQuery(queries, name);
            return query.fn({ args, ctx: { userID: u?.user.id ?? "anon" } });
          },
          schema,
          request,
        );

        return Response.json(result);
      },
    },
  },
});
