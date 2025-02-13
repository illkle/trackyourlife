import type { QueryClient } from "@tanstack/react-query";
import * as React from "react";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { Meta, Scripts } from "@tanstack/start";

import { LazyMotionProvider } from "~/components/Providers/lazyFramerMotionProvider";
import { ThemeProvider } from "~/components/Providers/next-themes/themes";
import { SingletonProvider } from "~/components/Providers/singletonProvider";
import appCss from "~/styles/app.css?url";
import textEditorCss from "~/styles/textEditor.css?url";
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
      { rel: "stylesheet", href: textEditorCss },
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

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : React.lazy(() =>
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      );

//  import.meta.env.DEV  is a temporary HMR HACK https://github.com/TanStack/router/issues/1992
function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning={true}>
      <head>
        <Meta />
      </head>

      <body className="overscroll-none bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
        <SingletonProvider>
          <LazyMotionProvider>
            <ThemeProvider defaultTheme="dark" attribute="class">
              <UserPreloader>{children}</UserPreloader>
              <Scripts />
            </ThemeProvider>
          </LazyMotionProvider>
        </SingletonProvider>
      </body>
    </html>
  );
}
