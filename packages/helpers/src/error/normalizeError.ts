import { formatISO } from "date-fns";

import type { ErrorDebugPayload, NormalizedError } from "./types";

const getStringField = (value: unknown, field: string) => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const maybe = Reflect.get(value, field);
  return typeof maybe === "string" ? maybe : undefined;
};

export const normalizeError = (value: unknown): NormalizedError => {
  if (value instanceof Error) {
    const cause = value.cause;
    return {
      name: value.name || "Error",
      message: value.message || "Unknown error",
      stack: value.stack,
      cause: typeof cause === "string" ? cause : undefined,
    };
  }

  if (typeof value === "string") {
    return {
      name: "Error",
      message: value,
    };
  }

  const message = getStringField(value, "message");
  const name = getStringField(value, "name");
  const stack = getStringField(value, "stack");

  if (message || name || stack) {
    return {
      name: name || "Error",
      message: message || "Unknown error",
      stack,
    };
  }

  return {
    name: "Error",
    message: "Unknown error",
  };
};

const createErrorId = () => {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ERR-${Date.now()}-${random}`;
};

export const createErrorDebugPayload = ({
  error,
  boundaryName,
  componentStack,
  route,
}: {
  error: unknown;
  boundaryName: string;
  componentStack?: string;
  route?: string;
}): ErrorDebugPayload => {
  return {
    id: createErrorId(),
    boundaryName,
    createdAt: formatISO(new Date()),
    error: normalizeError(error),
    componentStack,
    route,
  };
};
