import { mustGetMutator } from "@rocicorp/zero";
import { handleMutateRequest } from "@rocicorp/zero/server";
import { createFileRoute } from "@tanstack/react-router";

import { dbProvider } from "@tyl/db";
import { mutators } from "@tyl/db/mutators";

import { auth } from "~/auth/server";

export const Route = createFileRoute("/api/zero/mutate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const u = await auth.api.getSession({ headers: request.headers });

        console.log("POST TO MUTATE", u);

        const result = await handleMutateRequest(
          dbProvider,
          (transact) =>
            transact((tx, name, args) => {
              const mutator = mustGetMutator(mutators, name);
              return mutator.fn({
                args,
                tx,
                ctx: { userID: u?.user.id ?? "anon" },
              });
            }),
          request,
        );

        console.log("MUTATION HANDLED");

        return Response.json(result);
      },
    },
  },
});
