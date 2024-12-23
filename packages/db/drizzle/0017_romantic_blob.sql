CREATE TABLE IF NOT EXISTS "TYL_account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "TYL_jwks" (
	"id" text PRIMARY KEY NOT NULL,
	"publicKey" text NOT NULL,
	"privateKey" text NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "TYL_session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "TYL_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "TYL_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp,
	"updatedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "TYL_user_session" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "TYL_user_session" CASCADE;--> statement-breakpoint
ALTER TABLE "TYL_auth_user" RENAME TO "TYL_user";--> statement-breakpoint
ALTER TABLE "TYL_user" RENAME COLUMN "username" TO "name";--> statement-breakpoint
ALTER TABLE "TYL_user" DROP CONSTRAINT "TYL_auth_user_email_unique";--> statement-breakpoint
ALTER TABLE "TYL_trackable" DROP CONSTRAINT "TYL_trackable_user_id_TYL_auth_user_id_fk";
--> statement-breakpoint
ALTER TABLE "TYL_trackableRecord" DROP CONSTRAINT "TYL_trackableRecord_user_id_TYL_auth_user_id_fk";
--> statement-breakpoint
ALTER TABLE "TYL_user" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "TYL_user" ALTER COLUMN "email" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "TYL_trackable" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "TYL_trackable" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "TYL_trackable" ALTER COLUMN "attached_note" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "TYL_trackableRecord" ALTER COLUMN "value" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "TYL_trackableRecord" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "TYL_user" ADD COLUMN "emailVerified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "TYL_user" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "TYL_user" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "TYL_user" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TYL_account" ADD CONSTRAINT "TYL_account_userId_TYL_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."TYL_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TYL_session" ADD CONSTRAINT "TYL_session_userId_TYL_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."TYL_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TYL_trackable" ADD CONSTRAINT "TYL_trackable_user_id_TYL_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."TYL_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TYL_trackableRecord" ADD CONSTRAINT "TYL_trackableRecord_user_id_TYL_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."TYL_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "TYL_user" DROP COLUMN IF EXISTS "hashed_password";--> statement-breakpoint
ALTER TABLE "TYL_user" DROP COLUMN IF EXISTS "settings";--> statement-breakpoint
ALTER TABLE "TYL_user" DROP COLUMN IF EXISTS "role";--> statement-breakpoint
ALTER TABLE "TYL_user" ADD CONSTRAINT "TYL_user_email_unique" UNIQUE("email");