ALTER TABLE "TYL_trackableRecord" DROP CONSTRAINT "TYL_trackableRecord_trackableId_date_pk";--> statement-breakpoint
ALTER TABLE "TYL_trackableRecord" ADD COLUMN "recordId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;