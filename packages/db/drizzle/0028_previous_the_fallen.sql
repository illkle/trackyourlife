CREATE TABLE IF NOT EXISTS "TYL_trackableFlags" (
	"trackableId" uuid NOT NULL,
	"key" text NOT NULL,
	"value" json DEFAULT '{}'::json,
	CONSTRAINT "TYL_trackableFlags_trackableId_key_pk" PRIMARY KEY("trackableId","key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "TYL_userFlags" (
	"userId" text NOT NULL,
	"key" text NOT NULL,
	"value" json DEFAULT '{}'::json,
	CONSTRAINT "TYL_userFlags_userId_key_pk" PRIMARY KEY("userId","key")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TYL_trackableFlags" ADD CONSTRAINT "TYL_trackableFlags_trackableId_TYL_trackable_id_fk" FOREIGN KEY ("trackableId") REFERENCES "public"."TYL_trackable"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TYL_userFlags" ADD CONSTRAINT "TYL_userFlags_userId_TYL_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."TYL_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "TYL_trackable" DROP COLUMN IF EXISTS "attached_note";--> statement-breakpoint
ALTER TABLE "TYL_trackable" DROP COLUMN IF EXISTS "settings";