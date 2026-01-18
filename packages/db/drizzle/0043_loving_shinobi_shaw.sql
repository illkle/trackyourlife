DROP TABLE "TYL_trackableRecordAttributes" CASCADE;--> statement-breakpoint
DELETE FROM "TYL_trackable" WHERE "type" IN ('tags', 'logs');--> statement-breakpoint
ALTER TABLE "TYL_trackable" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint

DROP TYPE "public"."type";--> statement-breakpoint
CREATE TYPE "public"."type" AS ENUM('boolean', 'number', 'text');--> statement-breakpoint
ALTER TABLE "TYL_trackable" ALTER COLUMN "type" SET DATA TYPE "public"."type" USING "type"::"public"."type";--> statement-breakpoint
ALTER TABLE "TYL_trackableRecord" DROP COLUMN "attributes";--> statement-breakpoint
DROP TYPE "public"."attributeType";