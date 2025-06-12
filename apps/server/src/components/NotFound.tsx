import { Link } from "@tanstack/react-router";

import { Button } from "~/@shad/components/button";

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center space-y-2 p-6">
      <div className="opacity-80">
        <p>The page you are looking for does not exist.</p>
      </div>
      <p className="flex flex-wrap items-center gap-2">
        <Button variant={"secondary"} onClick={() => window.history.back()}>
          Go back
        </Button>
        <Button asChild variant={"secondary"}>
          <Link to="/">Start Over</Link>
        </Button>
      </p>
    </div>
  );
}
