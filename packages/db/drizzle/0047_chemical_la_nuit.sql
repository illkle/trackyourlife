ALTER TABLE "TYL_trackable" ADD COLUMN "bucketing" text;--> statement-breakpoint
UPDATE "TYL_trackable" SET "bucketing" = 'day' WHERE "bucketing" IS NULL;
