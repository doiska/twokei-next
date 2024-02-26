ALTER TABLE "public"."analytics_track_info" ALTER COLUMN "duration_in_ms" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "public"."analytics_track_info" ALTER COLUMN "duration_in_ms" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "public"."analytics_track_info" SET SCHEMA public;
