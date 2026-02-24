ALTER TABLE "TYL_trackable" ALTER COLUMN "bucketing" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "TYL_userFlags" ALTER COLUMN "value" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "TYL_userFlags" ALTER COLUMN "value" SET DEFAULT '{}'::json;