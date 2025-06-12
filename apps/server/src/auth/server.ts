import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";

import { db } from "@tyl/db";

import {
  sendChangeVerificationEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
} from "~/auth/email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: process.env.RESEND_API_KEY
      ? async ({ user, url }) => {
          await sendResetPasswordEmail(user.email, url);
        }
      : undefined,
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
        await sendChangeVerificationEmail(
          data.user.email,
          data.url,
          data.newEmail,
        );
      },
    },
  },

  secret: process.env.BETTER_AUTH_SECRET,
  plugins: [jwt({})],
});
