import { useRef, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, Stack } from "expo-router";

import { Button } from "~/app/_ui/button";
import { Input } from "~/app/_ui/input";
import { useSession } from "~/data/authContext";
import { getHostLink } from "~/utils/api";
import { tws } from "~/utils/tw";

const errorInfo: Record<string, string> = {
  "Network request failed":
    ". If you are connected to the internet this usually means host is typed incorrectly. \n\nMost common mistake is not specifying protocol: tyl.illkle.com should be https://tyl.illkle.com (use http:// when connecting to a server without TLS certificate)",
};

const LoginForm = () => {
  const { signIn } = useSession();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  const host = useRef("http://localhost:3000");
  const email = useRef("k.kelolov@gmail.com");
  const password = useRef("flier-omelette-deponent-vintage");

  const logIn = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        getHostLink(host.current) + "api/user/logintoken",
        {
          method: "POST",
          body: JSON.stringify({
            email: email.current,
            password: password.current,
          }),
          credentials: "include",
        },
      );

      const j = (await res.json()) as Record<string, string>;

      if (!res.ok) {
        if (j.error) {
          setError(j.error);
        }
      } else {
        const { token, userId } = j;

        if (token && userId) {
          setToken(token);
          await signIn({ token, host: host.current, userId });

          router.replace("/");
        } else {
          setError("Unknown error");
        }
      }
    } catch (e) {
      console.log(e);
      if (e instanceof Error) {
        setError(String(e.message + errorInfo[e.message] ?? ""));

        return;
      }
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text
        style={tws(
          "text-4xl py-5 font-black tracking-wider text-neutral-950 dark:text-neutral-50",
        )}
      >
        TYL
      </Text>

      <Text style={tws("text-lg text-color-base")}>Host</Text>
      <Input
        defaultValue={host.current}
        autoCapitalize="none"
        placeholder="https://tyl.illkle.com"
        style={tws("mt-2")}
        onChangeText={(v) => (host.current = v)}
      />
      <Text style={tws("mt-6 text-lg text-color-base")}>Email</Text>
      <Input
        defaultValue={email.current}
        placeholder="kel@gmail.com"
        autoCapitalize="none"
        autoComplete="email"
        style={tws("mt-1")}
        onChangeText={(v) => (email.current = v)}
      />
      <Text style={tws("mt-2 text-lg text-color-base")}>Password</Text>
      <Input
        defaultValue={password.current}
        autoCapitalize="none"
        autoComplete="current-password"
        style={tws("mt-1")}
        onChangeText={(v) => (password.current = v)}
      />
      <Button
        size={"lg"}
        variant={"outline"}
        style={tws("mt-6")}
        onPress={logIn}
        loading={loading}
      >
        Login
      </Button>
      <Text style={tws("text-red-500 dark:text-red-600 mt-4")}>{error}</Text>
    </View>
  );
};

export default function Index() {
  return (
    <SafeAreaView style={tws("")}>
      <Stack.Screen options={{ title: "Home Page" }} />
      <View style={tws("h-full w-full p-4")}>
        <LoginForm />
      </View>
    </SafeAreaView>
  );
}
