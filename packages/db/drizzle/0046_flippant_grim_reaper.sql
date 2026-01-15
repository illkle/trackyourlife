ALTER TABLE "TYL_trackableRecord" RENAME COLUMN "date" TO "timestamp";--> statement-breakpoint
DROP INDEX "trackable_date_idx";--> statement-breakpoint
DROP INDEX "user_date_idx";--> statement-breakpoint
ALTER TABLE "TYL_trackableRecord" ADD COLUMN "time_bucket" timestamp;--> statement-breakpoint
UPDATE "TYL_trackableRecord" SET "time_bucket" = date_trunc('day', "timestamp");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_track_time_bucket" ON "TYL_trackableRecord" USING btree ("trackable_id","time_bucket") WHERE "TYL_trackableRecord"."time_bucket" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "trackable_date_idx" ON "TYL_trackableRecord" USING btree ("trackable_id","timestamp");--> statement-breakpoint
CREATE INDEX "user_date_idx" ON "TYL_trackableRecord" USING btree ("user_id","timestamp");--> statement-breakpoint
ALTER TABLE "TYL_trackableRecord" DROP COLUMN "created_at";