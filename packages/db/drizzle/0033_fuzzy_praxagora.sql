CREATE TYPE "public"."attributeType" AS ENUM ('boolean', 'number', 'text');

ALTER TABLE "TYL_trackableRecordAttributes"
DROP COLUMN "type";

ALTER TABLE "TYL_trackableRecordAttributes"
ADD COLUMN "type" "attributeType" NOT NULL;