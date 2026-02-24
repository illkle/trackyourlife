import { Spinner } from "@/components/ui/spinner";
import { ReactNode, startTransition, useEffect, useState } from "react";
import { View } from "react-native";

/** Expo route blocks on component rendering and components that fetch from tanstack are synchronously creating requests which can be somewhat slow
 * This is a hacky way to render instantly, show spinner then show actual content
 */
export const InstaMount = ({ children }: { children: ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setIsMounted(true);
    });

    return;
  }, []);

  if (!isMounted) {
    return (
      <View className="flex h-64 items-center justify-center opacity-30">
        <Spinner />
      </View>
    );
  }

  return <>{children}</>;
};
