DROP TABLE "dev"."giftcards";--> statement-breakpoint
ALTER TABLE "app"."guilds" RENAME TO "core_guilds";--> statement-breakpoint
ALTER TABLE "app"."users" RENAME TO "core_users";--> statement-breakpoint
ALTER TABLE "dev"."song_profile_sources" DROP CONSTRAINT "song_profile_sources_user_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "dev"."song_user_events" DROP CONSTRAINT "song_user_events_user_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "dev"."users_benefits" DROP CONSTRAINT "users_benefits_user_id_users_user_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dev"."song_profile_sources" ADD CONSTRAINT "song_profile_sources_user_id_core_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "dev"."core_users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dev"."song_user_events" ADD CONSTRAINT "song_user_events_user_id_core_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "dev"."core_users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dev"."users_benefits" ADD CONSTRAINT "users_benefits_user_id_core_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "dev"."core_users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
