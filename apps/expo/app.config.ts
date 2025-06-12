import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "TrackYourLife",
  slug: "tyl",
  scheme: "expo",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "cover",
    backgroundColor: "#0A0A0A",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "illkle.trackyourlife",
    supportsTablet: false,
  },
  android: {
    package: "illkle.trackyourlife",
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#0A0A0A",
    },
  },
  extra: {
    eas: {
      projectId: "2d64b007-4a9b-4890-a429-35105ec5ed3a",
    },
  },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
    reactCanary: true,
  },
  plugins: ["expo-router"],
});
