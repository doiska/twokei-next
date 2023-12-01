ALTER TABLE "dev"."player_song_channels" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "dev"."player_song_channels" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "dev"."analytics_user_added_tracks" ADD CONSTRAINT "analytics_user_added_tracks_user_id_track_id_guild_id_unique" UNIQUE("user_id","track_id","guild_id");--> statement-breakpoint
ALTER TABLE "dev"."analytics_user_listened_tracks" ADD CONSTRAINT "analytics_user_listened_tracks_user_id_track_id_guild_id_unique" UNIQUE("user_id","track_id","guild_id");