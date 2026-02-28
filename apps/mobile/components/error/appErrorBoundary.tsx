import { Component, type ErrorInfo, type ReactNode } from "react";

import { createErrorDebugPayload, type ErrorDebugPayload } from "@tyl/helpers";
import { ErrorFallbackModal } from "@/components/error/errorFallbackModal";

interface AppErrorBoundaryProps {
  children: ReactNode;
  boundaryName: string;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  payload: ErrorDebugPayload | null;
}

class AppErrorBoundaryInternal extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public state: AppErrorBoundaryState = {
    hasError: false,
    payload: null,
  };

  public static getDerivedStateFromError() {
    return {
      hasError: true,
      payload: null,
    };
  }

  public componentDidCatch(error: unknown, info: ErrorInfo) {
    const payload = createErrorDebugPayload({
      error,
      boundaryName: this.props.boundaryName,
      componentStack: info.componentStack || undefined,
    });

    this.setState({ payload });
    console.error("[AppErrorBoundary]", payload);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, payload: null });
  };

  public render() {
    if (this.state.hasError && this.state.payload) {
      return <ErrorFallbackModal payload={this.state.payload} onRetry={this.handleRetry} />;
    }

    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

export const AppErrorBoundary = ({ children, boundaryName }: AppErrorBoundaryProps) => {
  return (
    <AppErrorBoundaryInternal boundaryName={boundaryName}>{children}</AppErrorBoundaryInternal>
  );
};
