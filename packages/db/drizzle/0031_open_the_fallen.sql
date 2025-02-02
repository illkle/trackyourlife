CREATE TABLE IF NOT EXISTS "TYL_trackableRecordAttributes" (
	"user_id" text NOT NULL,
	"trackableId" uuid NOT NULL,
	"recordId" uuid NOT NULL,
	"key" text NOT NULL,
	"value" text,
	CONSTRAINT "TYL_trackableRecordAttributes_user_id_trackableId_recordId_key_pk" PRIMARY KEY("user_id","trackableId","recordId","key")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TYL_trackableRecordAttributes" ADD CONSTRAINT "TYL_trackableRecordAttributes_user_id_TYL_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."TYL_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TYL_trackableRecordAttributes" ADD CONSTRAINT "TYL_trackableRecordAttributes_trackableId_TYL_trackable_id_fk" FOREIGN KEY ("trackableId") REFERENCES "public"."TYL_trackable"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TYL_trackableRecordAttributes" ADD CONSTRAINT "TYL_trackableRecordAttributes_recordId_TYL_trackableRecord_recordId_fk" FOREIGN KEY ("recordId") REFERENCES "public"."TYL_trackableRecord"("recordId") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
