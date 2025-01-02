CREATE TABLE IF NOT EXISTS "TYL_trackableGroup" (
	"trackableId" uuid NOT NULL,
	"group" text NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "TYL_trackableGroup_trackableId_group_pk" PRIMARY KEY("trackableId","group")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TYL_trackableGroup" ADD CONSTRAINT "TYL_trackableGroup_trackableId_TYL_trackable_id_fk" FOREIGN KEY ("trackableId") REFERENCES "public"."TYL_trackable"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TYL_trackableGroup" ADD CONSTRAINT "TYL_trackableGroup_user_id_TYL_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."TYL_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
