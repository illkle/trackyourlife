CREATE TABLE "TYL_ingestApiKeys" (
	"userId" text NOT NULL,
	"trackableId" uuid NOT NULL,
	"key" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"daysLimit" integer NOT NULL,
	CONSTRAINT "TYL_ingestApiKeys_userId_trackableId_key_pk" PRIMARY KEY("userId","trackableId","key")
);
--> statement-breakpoint
ALTER TABLE "TYL_trackableRecord" ADD COLUMN "externalKey" text;--> statement-breakpoint
ALTER TABLE "TYL_ingestApiKeys" ADD CONSTRAINT "TYL_ingestApiKeys_userId_TYL_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."TYL_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TYL_ingestApiKeys" ADD CONSTRAINT "TYL_ingestApiKeys_trackableId_TYL_trackable_id_fk" FOREIGN KEY ("trackableId") REFERENCES "public"."TYL_trackable"("id") ON DELETE cascade ON UPDATE no action;