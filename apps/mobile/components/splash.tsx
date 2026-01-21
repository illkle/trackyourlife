import * as SplashScreen from "expo-splash-screen";

import { useAuthClient } from "@/lib/authClient";

export function SplashScreenController() {
  const { authClient, serverURL } = useAuthClient();
  const { isPending } = authClient.useSession();

  if (!isPending || !serverURL) {
    SplashScreen.hide();
  }

  return null;
}
