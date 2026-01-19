import { Navigate } from "@tanstack/react-router";
import { createContext, useContext } from "react";

import { Spinner } from "~/@shad/components/spinner";
import { authClient } from "~/auth/client";

const AuthContext = createContext<{
  session: ReturnType<typeof authClient.useSession>["data"] | null;
}>({
  session: null,
});

export const UserPreloader = ({
  children,
  redirectOnNoAuth,
  redirectOnAuth,
}: {
  children: React.ReactNode;
  redirectOnNoAuth?: boolean;
  redirectOnAuth?: boolean;
}) => {
  const auth = authClient.useSession();

  if (auth.isPending) {
    return (
      <div className="flex h-svh w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (redirectOnNoAuth && !auth.data) {
    return <Navigate to="/auth/login" />;
  }
  if (redirectOnAuth && auth.data) {
    return <Navigate to="/app" />;
  }

  return <AuthContext.Provider value={{ session: auth.data }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export const useAuthAuthed = () => {
  const { session } = useAuth();
  if (!session) {
    throw new Error("No auth, this should never happen");
  }
  return session;
};
