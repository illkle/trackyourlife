ALTER TABLE "TYL_trackableRecord" DROP CONSTRAINT "TYL_trackableRecord_trackableId_date_unique";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_id_idx" ON "TYL_trackable" USING btree ("user_id","id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_name_idx" ON "TYL_trackable" USING btree ("user_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_date" ON "TYL_trackableRecord" USING btree ("trackableId",date_trunc('day', "date"));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trackable_date_idx" ON "TYL_trackableRecord" USING btree ("trackableId","date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_date_idx" ON "TYL_trackableRecord" USING btree ("user_id","date");--> statement-breakpoint
ALTER TABLE "TYL_trackable" DROP COLUMN IF EXISTS "is_deleted";