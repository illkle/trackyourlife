import type { ErrorComponentProps } from "@tanstack/react-router";
import {
  ErrorComponent,
  Link,
  Navigate,
  rootRouteId,
  useMatch,
  useRouter,
} from "@tanstack/react-router";

import { Button } from "~/@shad/components/button";
import { UnauthorizedError } from "~/utils/useSessionInfo";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  });

  console.error(error);

  if (error.message === UnauthorizedError) {
    return <Navigate to="/auth/login" />;
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 p-4">
      <ErrorComponent error={error} />
      <div className="flex w-fit flex-wrap items-center gap-2">
        <Button
          variant={"outline"}
          onClick={() => {
            void router.invalidate();
          }}
        >
          Try Again
        </Button>
        {isRoot ? (
          <Button
            render={<Link to="/">Home</Link>}
            variant={"secondary"}
          ></Button>
        ) : (
          <Button
            render={<Link to="/">Home</Link>}
            variant={"secondary"}
            onClick={(e) => {
              e.preventDefault();
              window.history.back();
            }}
          ></Button>
        )}
      </div>
    </div>
  );
}
