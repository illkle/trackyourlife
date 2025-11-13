import type { QueryClient } from "@tanstack/react-query";
import * as React from "react";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";

import { LazyMotionProvider } from "~/components/Providers/lazyFramerMotionProvider";
import { ThemeProvider } from "~/components/Providers/next-themes/themes";
import appCss from "~/styles/app.css?url";
import { seo } from "~/utils/seo.js";
import { ensureSessionInfo, UserPreloader } from "~/utils/useSessionInfo";

const iconPrefix = (path: string) =>
  process.env.SITE === "stage" ? `/stg${path}` : path;

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: iconPrefix("/apple-touch-icon.png"),
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: iconPrefix("/favicon-32x32.png"),
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: iconPrefix("/favicon-16x16.png"),
      },
      {
        rel: "icon",
        href: iconPrefix("/favicon.ico"),
      },
    ],
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      ...seo({
        title: "TrackYourLife",
        description: `TrackYourLife is an app to track habits, mood, weight or whatever you want `,
      }),
    ],
  }),

  ssr: true,
  component: RootComponent,
  loader: async ({ context }) => {
    await ensureSessionInfo(context.queryClient);
  },
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning={true}>
      <head>
        <HeadContent />
      </head>

      <body className="bg-background text-foreground overscroll-none">
        <LazyMotionProvider>
          <ThemeProvider defaultTheme="dark" attribute="class">
            <UserPreloader>{children}</UserPreloader>
            <Scripts />
          </ThemeProvider>
        </LazyMotionProvider>
      </body>
    </html>
  );
}
