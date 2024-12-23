import { useQuery } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";

import { Spinner } from "~/@shad/components/spinner";
import { getSession } from "~/routes/__root";

export const useSessionInfo = () => {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => await getSession(),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

export const useSessionAuthed = () => {
  const { data, isPending } = useSessionInfo();

  if (!data || !data.sessionInfo || !data?.token) {
    throw redirect({ to: "/login" });
  }

  const { sessionInfo, token } = data;

  return { sessionInfo, token };
};

export const UserPreloader = ({ children }: { children: React.ReactNode }) => {
  const { isPending } = useSessionInfo();

  if (isPending) {
    return (
      <div className="flex h-svh w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <div>{children}</div>;
};
