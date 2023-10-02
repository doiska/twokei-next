CREATE TABLE IF NOT EXISTS "dev"."logs" (
	"id" serial NOT NULL,
	"environment" varchar DEFAULT 'Development',
	"severity" varchar NOT NULL,
	"source" varchar DEFAULT 'Twokei',
	"message" varchar NOT NULL,
	"trace" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dev"."core_settings" (
	"name" varchar PRIMARY KEY NOT NULL,
	"value" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dev"."song_user_playlists" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"playlist_name" varchar NOT NULL,
	"playlist_url" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dev"."users_benefits" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"benefits" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
DROP TABLE "app"."played_songs";--> statement-breakpoint
DROP TABLE "app"."users_playlists";--> statement-breakpoint
DROP TABLE "app"."song_profile";--> statement-breakpoint
ALTER TABLE "dev"."song_profile_actions" DROP CONSTRAINT "song_profile_actions_user_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "dev"."song_profile_actions" DROP CONSTRAINT "song_profile_actions_target_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "dev"."guilds" ALTER COLUMN "locale" SET DEFAULT 'pt_br';--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'dev'
                AND table_name = 'song_profile_actions'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "song_profile_actions" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'dev'
                AND table_name = 'song_user_events'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "song_user_events" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "dev"."users" ALTER COLUMN "locale" SET DEFAULT 'pt_br';--> statement-breakpoint
ALTER TABLE "dev"."users" ALTER COLUMN "locale" DROP NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dev"."users_benefits" ADD CONSTRAINT "users_benefits_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "dev"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "app"."guilds" SET SCHEMA "dev";
--> statement-breakpoint
ALTER TABLE "app"."song_channels" SET SCHEMA "dev";
--> statement-breakpoint
ALTER TABLE "app"."song_profile_actions" SET SCHEMA "dev";
--> statement-breakpoint
ALTER TABLE "app"."song_profile_sources" SET SCHEMA "dev";
--> statement-breakpoint
ALTER TABLE "app"."song_user_events" SET SCHEMA "dev";
--> statement-breakpoint
ALTER TABLE "app"."users" SET SCHEMA "dev";
