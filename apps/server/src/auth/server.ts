import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { apiKey, jwt } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { db } from "@tyl/db/server";

import {
  sendChangeVerificationEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
} from "./email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      if (!process.env.RESEND_API_KEY) return;
      void sendResetPasswordEmail(user.email, url);
    },
  },
  emailVerification: {
    sendVerificationEmail: process.env.RESEND_API_KEY
      ? async (data) => {
          await sendVerificationEmail(data.user.email, data.url);
        }
      : undefined,
    sendOnSignUp: true,
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async (data) => {
        await sendChangeVerificationEmail(data.user.email, data.url, data.newEmail);
      },
    },
  },

  secret: process.env.BETTER_AUTH_SECRET,
  plugins: [jwt({}), expo(), apiKey(), tanstackStartCookies()],
  trustedOrigins: ["tyl://"],
});
