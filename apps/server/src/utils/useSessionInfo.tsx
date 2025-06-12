/* eslint-disable @typescript-eslint/prefer-optional-chain */
import type { QueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";

import { Spinner } from "~/@shad/components/spinner";
import { auth } from "~/auth/server";

const getSession = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const r = getWebRequest();

    const [sessionInfo, { token }] = await Promise.all([
      auth.api.getSession({
        headers: r.headers,
      }),
      auth.api.getToken({
        headers: r.headers,
      }),
    ]);

    return { sessionInfo, token };
  } catch (e) {
    console.error(e);
    return { sessionInfo: null, token: null };
  }
});

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

export const UnauthorizedError = "Error: Unauthorized. Redirecting...";

export const useSessionAuthed = () => {
  const { data } = useSessionInfo();

  if (!data || !data.sessionInfo || !data.token) {
    throw new Error(UnauthorizedError);
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
