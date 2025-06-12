import { cn } from "~/@shad/utils";

export const Spinner = ({
  inverted = false,
  disabled = false,
}: {
  inverted?: boolean;
  disabled?: boolean;
}) => (
  <svg
    className={cn(
      "spinner mr-3 -ml-1 h-5 w-5 animate-spin",
      inverted && "spinner-inverted",
    )}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      strokeWidth="3"
    ></circle>
    <path
      className={cn(
        disabled ? "opacity-0" : "opacity-75",
        "transition-opacity duration-100",
      )}
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);
