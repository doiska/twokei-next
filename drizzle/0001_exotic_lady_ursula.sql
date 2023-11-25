CREATE TABLE IF NOT EXISTS "dev"."analytics_track_info" (
	"id" varchar PRIMARY KEY NOT NULL,
	"spotify_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"author" varchar,
	"duration" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dev"."analytics_user_added_tracks" (
	"user_id" varchar NOT NULL,
	"track_id" varchar NOT NULL,
	"guild_id" varchar,
	"listened" integer DEFAULT 1,
	"properties" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dev"."analytics_user_listened_tracks" (
	"user_id" varchar NOT NULL,
	"track_id" varchar NOT NULL,
	"guild_id" varchar,
	"listened" integer DEFAULT 1,
	"properties" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP TABLE "dev"."song_profile_actions";--> statement-breakpoint
DROP TABLE "dev"."song_profile_sources";--> statement-breakpoint
ALTER TABLE "dev"."song_channels" RENAME TO "player_song_channels";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dev"."analytics_user_added_tracks" ADD CONSTRAINT "analytics_user_added_tracks_track_id_analytics_track_info_id_fk" FOREIGN KEY ("track_id") REFERENCES "dev"."analytics_track_info"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dev"."analytics_user_listened_tracks" ADD CONSTRAINT "analytics_user_listened_tracks_track_id_analytics_track_info_id_fk" FOREIGN KEY ("track_id") REFERENCES "dev"."analytics_track_info"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
