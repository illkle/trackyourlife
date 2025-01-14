DELETE FROM "TYL_trackable" WHERE "type" = 'range';
ALTER TABLE "public"."TYL_trackable" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."type";--> statement-breakpoint
CREATE TYPE "public"."type" AS ENUM('boolean', 'number', 'text', 'tags', 'logs');--> statement-breakpoint
ALTER TABLE "public"."TYL_trackable" ALTER COLUMN "type" SET DATA TYPE "public"."type" USING "type"::"public"."type";