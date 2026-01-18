import { Button } from "@shad/components/button";
import { Spinner } from "@shad/components/spinner";

interface QueryErrorProps {
  error: Error | null;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const QueryError = ({ error, onRetry, isRetrying }: QueryErrorProps) => (
  <div className="flex flex-col items-center justify-center gap-3 p-4">
    <div className="text-sm font-medium text-destructive">
      {error?.message || "An error occurred"}
    </div>
    {onRetry && (
      <Button variant="outline" size="sm" onClick={onRetry} disabled={isRetrying}>
        {isRetrying && <Spinner className="mr-2 h-3 w-3" />}
        Try Again
      </Button>
    )}
  </div>
);
