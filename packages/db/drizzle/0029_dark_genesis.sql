ALTER TABLE "TYL_trackableFlags" DROP CONSTRAINT "TYL_trackableFlags_trackableId_key_pk";--> statement-breakpoint
ALTER TABLE "TYL_trackableFlags" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TYL_trackableFlags" ADD CONSTRAINT "TYL_trackableFlags_user_id_TYL_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."TYL_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
