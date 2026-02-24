const NETWORK_MESSAGE_PATTERNS = [
  "network",
  "fetch",
  "timed out",
  "timeout",
  "connection",
  "offline",
  "failed to fetch",
  "socket",
];

export const getErrorStatus = (error: unknown): number | null => {
  if (!error || typeof error !== "object") return null;
  const status = (error as { status?: unknown }).status;
  return typeof status === "number" ? status : null;
};

export const getErrorMessage = (error: unknown): string => {
  if (!error || typeof error !== "object") return "Unknown error";
  const message = (error as { message?: unknown }).message;
  return typeof message === "string" && message.length > 0 ? message : "Unknown error";
};

export const isAuthFailureError = (error: unknown) => {
  const status = getErrorStatus(error);
  return status === 401 || status === 403;
};

export const isLikelyRecoverableSessionError = (error: unknown) => {
  const status = getErrorStatus(error);
  if (status === null || status === 0) return true;
  if (status >= 500) return true;

  const message = getErrorMessage(error).toLowerCase();
  return NETWORK_MESSAGE_PATTERNS.some((pattern) => message.includes(pattern));
};
