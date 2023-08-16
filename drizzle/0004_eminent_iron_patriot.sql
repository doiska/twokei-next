CREATE TABLE IF NOT EXISTS "app"."guilds" (
	"guild_id" varchar PRIMARY KEY NOT NULL,
	"name" varchar,
	"locale" varchar DEFAULT 'en_us' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "app"."played_songs" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"guild_id" varchar NOT NULL,
	"amount" integer DEFAULT 1 NOT NULL,
	"song_name" varchar NOT NULL,
	"song_url" varchar NOT NULL,
	"song_length" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "app"."users_playlists" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"playlist_name" varchar NOT NULL,
	"playlist_url" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "app"."song_channels" (
	"guild_id" varchar PRIMARY KEY NOT NULL,
	"channel_id" varchar NOT NULL,
	"message_id" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "app"."song_profile" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"last_synced" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "app"."song_profile_sources" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"source" varchar,
	"source_url" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "app"."users" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"name" varchar,
	"locale" varchar DEFAULT 'en_us' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "songUrlUnique" ON "app"."played_songs" ("song_url","user_id");
DO $$ BEGIN
 ALTER TABLE "app"."played_songs" ADD CONSTRAINT "played_songs_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "app"."song_profile" ADD CONSTRAINT "song_profile_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "app"."song_profile_sources" ADD CONSTRAINT "song_profile_sources_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
