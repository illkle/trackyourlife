import { Spinner } from "~/@shad/components/spinner";

export const MaybeLoading = ({
  isLoading,
  children,
}: {
  isLoading: boolean;
  children: React.ReactNode;
}) => {
  if (isLoading) {
    return <Spinner />;
  }
  return <>{children}</>;
};
