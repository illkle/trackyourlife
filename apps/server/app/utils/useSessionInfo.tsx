import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { redirect, useRouter } from "@tanstack/react-router";

import { Spinner } from "~/@shad/components/spinner";
import { getSession } from "~/routes/__root";

const q = {
  queryKey: ["session"],
  queryFn: async () => await getSession(),
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
};

export const invalidateSession = async (qc: QueryClient) => {
  await qc.invalidateQueries({ queryKey: ["session"] });
};

export const ensureSessionInfo = async (qc: QueryClient) => {
  await qc.ensureQueryData(q);
};

export const useSessionInfo = () => {
  return useQuery(q);
};

export const useSessionAuthed = () => {
  const router = useRouter();

  const { data, isPending } = useSessionInfo();

  if (!data || !data.sessionInfo || !data?.token) {
    router.navigate({ to: "/login" });
    throw new Error("Unauthorized");
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
