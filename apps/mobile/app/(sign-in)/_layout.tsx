import { Stack } from "expo-router";
import { AppErrorBoundary } from "@/components/error/appErrorBoundary";

export default function SignInLayout() {
  return (
    <AppErrorBoundary boundaryName="sign-in-routes">
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="user"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </AppErrorBoundary>
  );
}
