import type { QueryClient } from "@tanstack/react-query";
import * as React from "react";
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";

import { LazyMotionProvider } from "~/components/Providers/lazyFramerMotionProvider";
import { ThemeProvider } from "~/components/Providers/next-themes/themes";
import appCss from "~/styles/app.css?url";
import { seo } from "~/utils/seo.js";

const IS_STG = import.meta.env.VITE_ENABLE_DEVTOOLS === "true";

const iconPrefix = (path: string) => (IS_STG ? `/stg${path}` : path);

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
    scripts: IS_STG
      ? [
          {
            crossOrigin: "anonymous",
            src: "//unpkg.com/react-scan/dist/auto.global.js",
          },
        ]
      : [],
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

  component: RootComponent,
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

      <body className="overscroll-none bg-background text-foreground">
        <LazyMotionProvider>
          <ThemeProvider defaultTheme="dark" attribute="class">
            {children}
            <Scripts />
          </ThemeProvider>
        </LazyMotionProvider>
      </body>
    </html>
  );
}
