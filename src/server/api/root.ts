import { createTRPCRouter } from "./trpc";
import { trackableRouter } from "./routers/trackable";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  trackable: trackableRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
