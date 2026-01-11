ALTER TABLE "TYL_ingestApiKeys" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "TYL_ingestApiKeys" RENAME COLUMN "trackableId" TO "trackable_id";--> statement-breakpoint
ALTER TABLE "TYL_ingestApiKeys" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "TYL_ingestApiKeys" RENAME COLUMN "daysLimit" TO "days_limit";--> statement-breakpoint
ALTER TABLE "TYL_trackableFlags" RENAME COLUMN "trackableId" TO "trackable_id";--> statement-breakpoint
ALTER TABLE "TYL_trackableGroup" RENAME COLUMN "trackableId" TO "trackable_id";--> statement-breakpoint
ALTER TABLE "TYL_trackableRecord" RENAME COLUMN "recordId" TO "record_id";--> statement-breakpoint
ALTER TABLE "TYL_trackableRecord" RENAME COLUMN "trackableId" TO "trackable_id";--> statement-breakpoint
ALTER TABLE "TYL_trackableRecord" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "TYL_trackableRecord" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "TYL_trackableRecord" RENAME COLUMN "externalKey" TO "external_key";--> statement-breakpoint
ALTER TABLE "TYL_trackableRecordAttributes" RENAME COLUMN "trackableId" TO "trackable_id";--> statement-breakpoint
ALTER TABLE "TYL_trackableRecordAttributes" RENAME COLUMN "recordId" TO "record_id";--> statement-breakpoint
ALTER TABLE "TYL_userFlags" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "TYL_ingestApiKeys" DROP CONSTRAINT "TYL_ingestApiKeys_userId_TYL_user_id_fk";
--> statement-breakpoint
ALTER TABLE "TYL_ingestApiKeys" DROP CONSTRAINT "TYL_ingestApiKeys_trackableId_TYL_trackable_id_fk";
--> statement-breakpoint
ALTER TABLE "TYL_trackableFlags" DROP CONSTRAINT "TYL_trackableFlags_trackableId_TYL_trackable_id_fk";
--> statement-breakpoint
ALTER TABLE "TYL_trackableGroup" DROP CONSTRAINT "TYL_trackableGroup_trackableId_TYL_trackable_id_fk";
--> statement-breakpoint
ALTER TABLE "TYL_trackableRecord" DROP CONSTRAINT "TYL_trackableRecord_trackableId_TYL_trackable_id_fk";
--> statement-breakpoint
ALTER TABLE "TYL_trackableRecordAttributes" DROP CONSTRAINT "TYL_trackableRecordAttributes_trackableId_TYL_trackable_id_fk";
--> statement-breakpoint
ALTER TABLE "TYL_trackableRecordAttributes" DROP CONSTRAINT "TYL_trackableRecordAttributes_recordId_TYL_trackableRecord_recordId_fk";
--> statement-breakpoint
ALTER TABLE "TYL_userFlags" DROP CONSTRAINT "TYL_userFlags_userId_TYL_user_id_fk";
--> statement-breakpoint
DROP INDEX "trackable_date_idx";--> statement-breakpoint
ALTER TABLE "TYL_ingestApiKeys" DROP CONSTRAINT "TYL_ingestApiKeys_userId_trackableId_key_pk";--> statement-breakpoint
ALTER TABLE "TYL_trackableFlags" DROP CONSTRAINT "TYL_trackableFlags_user_id_trackableId_key_pk";--> statement-breakpoint
ALTER TABLE "TYL_trackableGroup" DROP CONSTRAINT "TYL_trackableGroup_trackableId_group_pk";--> statement-breakpoint
ALTER TABLE "TYL_trackableRecordAttributes" DROP CONSTRAINT "TYL_trackableRecordAttributes_user_id_trackableId_recordId_key_pk";--> statement-breakpoint
ALTER TABLE "TYL_userFlags" DROP CONSTRAINT "TYL_userFlags_userId_key_pk";--> statement-breakpoint
ALTER TABLE "TYL_ingestApiKeys" ADD CONSTRAINT "TYL_ingestApiKeys_user_id_trackable_id_key_pk" PRIMARY KEY("user_id","trackable_id","key");--> statement-breakpoint
ALTER TABLE "TYL_trackableFlags" ADD CONSTRAINT "TYL_trackableFlags_user_id_trackable_id_key_pk" PRIMARY KEY("user_id","trackable_id","key");--> statement-breakpoint
ALTER TABLE "TYL_trackableGroup" ADD CONSTRAINT "TYL_trackableGroup_trackable_id_group_pk" PRIMARY KEY("trackable_id","group");--> statement-breakpoint
ALTER TABLE "TYL_trackableRecordAttributes" ADD CONSTRAINT "TYL_trackableRecordAttributes_user_id_trackable_id_record_id_key_pk" PRIMARY KEY("user_id","trackable_id","record_id","key");--> statement-breakpoint
ALTER TABLE "TYL_userFlags" ADD CONSTRAINT "TYL_userFlags_user_id_key_pk" PRIMARY KEY("user_id","key");--> statement-breakpoint
ALTER TABLE "TYL_ingestApiKeys" ADD CONSTRAINT "TYL_ingestApiKeys_user_id_TYL_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."TYL_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TYL_ingestApiKeys" ADD CONSTRAINT "TYL_ingestApiKeys_trackable_id_TYL_trackable_id_fk" FOREIGN KEY ("trackable_id") REFERENCES "public"."TYL_trackable"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TYL_trackableFlags" ADD CONSTRAINT "TYL_trackableFlags_trackable_id_TYL_trackable_id_fk" FOREIGN KEY ("trackable_id") REFERENCES "public"."TYL_trackable"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TYL_trackableGroup" ADD CONSTRAINT "TYL_trackableGroup_trackable_id_TYL_trackable_id_fk" FOREIGN KEY ("trackable_id") REFERENCES "public"."TYL_trackable"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TYL_trackableRecord" ADD CONSTRAINT "TYL_trackableRecord_trackable_id_TYL_trackable_id_fk" FOREIGN KEY ("trackable_id") REFERENCES "public"."TYL_trackable"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TYL_trackableRecordAttributes" ADD CONSTRAINT "TYL_trackableRecordAttributes_trackable_id_TYL_trackable_id_fk" FOREIGN KEY ("trackable_id") REFERENCES "public"."TYL_trackable"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TYL_trackableRecordAttributes" ADD CONSTRAINT "TYL_trackableRecordAttributes_record_id_TYL_trackableRecord_record_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."TYL_trackableRecord"("record_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TYL_userFlags" ADD CONSTRAINT "TYL_userFlags_user_id_TYL_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."TYL_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "trackable_date_idx" ON "TYL_trackableRecord" USING btree ("trackable_id","date");