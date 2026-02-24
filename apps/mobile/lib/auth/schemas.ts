import { z } from "zod";

export const AuthUserSchema = z
  .object({
    id: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    email: z.string(),
    emailVerified: z.boolean(),
    name: z.string(),
    image: z.string().nullable().optional(),
  })
  .passthrough();

export const AuthSessionSchema = z
  .object({
    id: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    userId: z.string(),
    expiresAt: z.coerce.date(),
    token: z.string(),
    ipAddress: z.string().nullable().optional(),
    userAgent: z.string().nullable().optional(),
  })
  .passthrough();

export const AuthDataSchema = z.object({
  user: AuthUserSchema,
  session: AuthSessionSchema,
});

export const CachedAuthRecordSchema = z.object({
  data: AuthDataSchema,
  cachedAt: z.coerce.date(),
});

export type AuthData = z.infer<typeof AuthDataSchema>;
export type CachedAuthRecord = z.infer<typeof CachedAuthRecordSchema>;
