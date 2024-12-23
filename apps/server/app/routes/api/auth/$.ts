import { createAPIFileRoute } from "@tanstack/start/api";

import { auth } from "~/auth/server";

export const APIRoute = createAPIFileRoute("/api/auth/$")({
  GET: ({ request }) => {
    return auth.handler(request);
  },
  POST: ({ request }) => {
    return auth.handler(request);
  },
});
