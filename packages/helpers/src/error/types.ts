export interface NormalizedError {
  name: string;
  message: string;
  stack?: string;
  cause?: string;
}

export interface ErrorDebugPayload {
  id: string;
  boundaryName: string;
  createdAt: string;
  error: NormalizedError;
  componentStack?: string;
  route?: string;
}
