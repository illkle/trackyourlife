import { createContext, useCallback, useContext, useRef } from "react";

interface SingletonContextType {
  registerSingleton: (id: string, onUnregister: () => void) => boolean;
  clear: (id: string) => void;
}

const SingletonContext = createContext<SingletonContextType | null>(null);

export const useSingleton = () => {
  const context = useContext(SingletonContext);
  if (!context) {
    throw new Error("useSingleton must be used within a SingletonProvider");
  }
  return context;
};

export const SingletonProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const currentIdRef = useRef<string | null>(null);
  const onUnregisterRef = useRef<(() => void) | null>(null);

  const registerSingleton = useCallback(
    (id: string, onUnregister: () => void) => {
      if (currentIdRef.current !== id) {
        // Call previous onUnregister if exists

        let noPrevious = true;

        if (onUnregisterRef.current) {
          onUnregisterRef.current();
          noPrevious = false;
        }

        // Update refs with new values
        currentIdRef.current = id;
        onUnregisterRef.current = onUnregister;
        return noPrevious;
      }
      return false;
    },
    [],
  );

  const clear = useCallback((id: string) => {
    if (currentIdRef.current === id) {
      currentIdRef.current = null;
      onUnregisterRef.current = null;
    }
  }, []);

  return (
    <SingletonContext.Provider value={{ registerSingleton, clear }}>
      {children}
    </SingletonContext.Provider>
  );
};
