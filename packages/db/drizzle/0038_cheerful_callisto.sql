ALTER TABLE "TYL_account" RENAME COLUMN "accountId" TO "account_id";--> statement-breakpoint
ALTER TABLE "TYL_account" RENAME COLUMN "providerId" TO "provider_id";--> statement-breakpoint
ALTER TABLE "TYL_account" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "TYL_account" RENAME COLUMN "accessToken" TO "access_token";--> statement-breakpoint
ALTER TABLE "TYL_account" RENAME COLUMN "refreshToken" TO "refresh_token";--> statement-breakpoint
ALTER TABLE "TYL_account" RENAME COLUMN "idToken" TO "id_token";--> statement-breakpoint
ALTER TABLE "TYL_account" RENAME COLUMN "accessTokenExpiresAt" TO "access_token_expires_at";--> statement-breakpoint
ALTER TABLE "TYL_account" RENAME COLUMN "refreshTokenExpiresAt" TO "refresh_token_expires_at";--> statement-breakpoint
ALTER TABLE "TYL_account" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "TYL_account" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "TYL_jwks" RENAME COLUMN "publicKey" TO "public_key";--> statement-breakpoint
ALTER TABLE "TYL_jwks" RENAME COLUMN "privateKey" TO "private_key";--> statement-breakpoint
ALTER TABLE "TYL_jwks" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "TYL_session" RENAME COLUMN "expiresAt" TO "expires_at";--> statement-breakpoint
ALTER TABLE "TYL_session" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "TYL_session" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "TYL_session" RENAME COLUMN "ipAddress" TO "ip_address";--> statement-breakpoint
ALTER TABLE "TYL_session" RENAME COLUMN "userAgent" TO "user_agent";--> statement-breakpoint
ALTER TABLE "TYL_session" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "TYL_user" RENAME COLUMN "emailVerified" TO "email_verified";--> statement-breakpoint
ALTER TABLE "TYL_user" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "TYL_user" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "TYL_verification" RENAME COLUMN "expiresAt" TO "expires_at";--> statement-breakpoint
ALTER TABLE "TYL_verification" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "TYL_verification" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "TYL_account" DROP CONSTRAINT "TYL_account_userId_TYL_user_id_fk";
--> statement-breakpoint
ALTER TABLE "TYL_session" DROP CONSTRAINT "TYL_session_userId_TYL_user_id_fk";
--> statement-breakpoint
ALTER TABLE "TYL_jwks" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "TYL_account" ADD CONSTRAINT "TYL_account_user_id_TYL_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."TYL_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TYL_session" ADD CONSTRAINT "TYL_session_user_id_TYL_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."TYL_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "TYL_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "TYL_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "TYL_verification" USING btree ("identifier");