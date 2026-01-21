import { createContext, ReactNode, useContext, useState } from "react";
import * as SecureStore from "expo-secure-store";

const ServerURLContext = createContext<{
  serverURL: string | null;
  powersyncURL: string | null;
  update: (newURLState: { serverURL: string; powersyncURL: string }) => void;
}>({
  serverURL: null,
  powersyncURL: null,
  update: () => {},
});

export const useServerURL = () => {
  return useContext(ServerURLContext);
};

export const ServerURLProvider = ({ children }: { children: ReactNode }) => {
  const [URLState, setURLState] = useState<{
    serverURL: string | null;
    powersyncURL: string | null;
  }>({
    serverURL: SecureStore.getItem("serverURL"),
    powersyncURL: SecureStore.getItem("powersyncURL"),
  });

  const update = (newURLState: { serverURL: string; powersyncURL: string }) => {
    SecureStore.setItem("serverURL", newURLState.serverURL);
    SecureStore.setItem("powersyncURL", newURLState.powersyncURL);
    console.log("NEW URL STATE", newURLState);
    setURLState(newURLState);
  };

  return (
    <ServerURLContext.Provider
      value={{ serverURL: URLState.serverURL, powersyncURL: URLState.powersyncURL, update }}
    >
      {children}
    </ServerURLContext.Provider>
  );
};
