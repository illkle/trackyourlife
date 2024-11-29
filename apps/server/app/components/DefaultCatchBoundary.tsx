import type { ErrorComponentProps } from "@tanstack/react-router";
import { Button } from "@shad/button";
import {
  ErrorComponent,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from "@tanstack/react-router";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  });

  console.error(error);

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
          <Button asChild variant={"secondary"}>
            <Link to="/">Home</Link>
          </Button>
        ) : (
          <Button
            asChild
            variant={"secondary"}
            onClick={(e) => {
              e.preventDefault();
              window.history.back();
            }}
          >
            <Link to="/">Home</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
