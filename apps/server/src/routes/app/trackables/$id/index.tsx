import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/trackables/$id/")({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    throw redirect({
      search: (prev) => ({
        ...prev,
      }),
      to: `/app/trackables/$id/view`,
      params: {
        id: params.id,
      },
    });
  },
});

function RouteComponent() {
  return "Hello /app/trackables/$id/!";
}
